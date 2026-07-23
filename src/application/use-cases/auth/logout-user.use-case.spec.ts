import { LogoutUserUseCase } from './logout-user.use-case';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { TokenService } from '../../ports/token-service.interface';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

describe('LogoutUserUseCase', () => {
  let mockTokenRepo: jest.Mocked<RefreshTokenRepository>;
  let mockTokenService: jest.Mocked<TokenService>;
  let useCase: LogoutUserUseCase;

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const activeToken = RefreshToken.create('rt-1', 'usr-1', 'hash_val', futureDate);

  beforeEach(() => {
    mockTokenRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByTokenHash: jest.fn().mockResolvedValue(activeToken),
      findByUserId: jest.fn(),
      revokeAllForUser: jest.fn().mockResolvedValue(undefined),
    };

    mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      hashToken: jest.fn().mockResolvedValue('hash_val'),
    };

    useCase = new LogoutUserUseCase(mockTokenRepo, mockTokenService);
  });

  it('should revoke token when refreshToken is provided', async () => {
    await useCase.execute({ refreshToken: 'some_refresh_token' });
    expect(mockTokenRepo.save).toHaveBeenCalled();
  });

  it('should revoke all user sessions when userId is provided', async () => {
    await useCase.execute({ userId: 'usr-1' });
    expect(mockTokenRepo.revokeAllForUser).toHaveBeenCalledWith('usr-1');
  });
});
