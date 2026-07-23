import { RefreshTokenUseCase } from './refresh-token.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { TokenService } from '../../ports/token-service.interface';
import { User } from '../../../domain/entities/user.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { Email } from '../../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../../domain/common/value-objects/password-hash.value-object';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { TokenRevokedException, UnauthorizedException } from '../../exceptions/auth.exceptions';

describe('RefreshTokenUseCase', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockTokenRepo: jest.Mocked<RefreshTokenRepository>;
  let mockTokenService: jest.Mocked<TokenService>;
  let useCase: RefreshTokenUseCase;

  const activeUser = User.create(
    'usr-1',
    Email.create('user@capital.mx'),
    PasswordHash.create('hashed'),
    'Carlos Analista',
    UserRole.ADMINISTRATOR,
  );

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const activeTokenEntity = RefreshToken.create('rt-1', 'usr-1', 'hash_old', futureDate);

  beforeEach(() => {
    mockUserRepo = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(activeUser),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    mockTokenRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByTokenHash: jest.fn().mockResolvedValue(activeTokenEntity),
      findByUserId: jest.fn(),
      revokeAllForUser: jest.fn().mockResolvedValue(undefined),
    };

    mockTokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('new_access_token'),
      generateRefreshToken: jest.fn().mockResolvedValue('new_refresh_token'),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn().mockResolvedValue({
        sub: 'usr-1',
        email: 'user@capital.mx',
        role: UserRole.ADMINISTRATOR,
        clientId: null,
      }),
      hashToken: jest.fn().mockImplementation(async (tok) => `hash_${tok}`),
    };

    useCase = new RefreshTokenUseCase(mockUserRepo, mockTokenRepo, mockTokenService);
  });

  it('should refresh token successfully and revoke old token', async () => {
    const result = await useCase.execute({ refreshToken: 'valid_refresh_token' });

    expect(result.accessToken).toBe('new_access_token');
    expect(result.refreshToken).toBe('new_refresh_token');
    expect(mockTokenRepo.save).toHaveBeenCalledTimes(2); // 1 for revoking old, 1 for saving new
  });

  it('should revoke all user sessions if token entity is invalid', async () => {
    const revokedToken = RefreshToken.create('rt-2', 'usr-1', 'hash_rev', futureDate);
    revokedToken.revoke();
    mockTokenRepo.findByTokenHash.mockResolvedValue(revokedToken);

    await expect(
      useCase.execute({ refreshToken: 'revoked_token' }),
    ).rejects.toThrow(TokenRevokedException);

    expect(mockTokenRepo.revokeAllForUser).toHaveBeenCalledWith('usr-1');
  });

  it('should throw UnauthorizedException if verifyRefreshToken fails', async () => {
    mockTokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid signature'));

    await expect(
      useCase.execute({ refreshToken: 'bad_token' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
