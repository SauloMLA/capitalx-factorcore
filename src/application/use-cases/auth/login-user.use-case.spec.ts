import { LoginUserUseCase } from './login-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { PasswordHasher } from '../../ports/password-hasher.interface';
import { TokenService } from '../../ports/token-service.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../../domain/common/value-objects/password-hash.value-object';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { InvalidCredentialsException, UserInactiveException } from '../../exceptions/auth.exceptions';

describe('LoginUserUseCase', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;
  let mockTokenRepo: jest.Mocked<RefreshTokenRepository>;
  let mockPasswordHasher: jest.Mocked<PasswordHasher>;
  let mockTokenService: jest.Mocked<TokenService>;
  let useCase: LoginUserUseCase;

  const activeUser = User.create(
    'usr-1',
    Email.create('user@capital.mx'),
    PasswordHash.create('hashed_pass'),
    'Carlos Analista',
    UserRole.ADMINISTRATOR,
  );

  beforeEach(() => {
    mockUserRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(activeUser),
      findAll: jest.fn(),
    };

    mockTokenRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByTokenHash: jest.fn(),
      findByUserId: jest.fn(),
      revokeAllForUser: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };

    mockTokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('access_token_xyz'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh_token_xyz'),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      hashToken: jest.fn().mockResolvedValue('hashed_refresh_token'),
    };

    useCase = new LoginUserUseCase(
      mockUserRepo,
      mockTokenRepo,
      mockPasswordHasher,
      mockTokenService,
    );
  });

  it('should authenticate user and return tokens', async () => {
    const result = await useCase.execute({
      email: 'user@capital.mx',
      password: 'password123',
    });

    expect(result.accessToken).toBe('access_token_xyz');
    expect(result.refreshToken).toBe('refresh_token_xyz');
    expect(result.user.email).toBe('user@capital.mx');
    expect(mockTokenRepo.save).toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException if user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@capital.mx', password: 'pass' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw UserInactiveException if user is inactive', async () => {
    const inactiveUser = User.create(
      'usr-2',
      Email.create('inactive@capital.mx'),
      PasswordHash.create('hashed'),
      'Inactive',
      UserRole.OPERATOR,
    );
    inactiveUser.deactivate();
    mockUserRepo.findByEmail.mockResolvedValue(inactiveUser);

    await expect(
      useCase.execute({ email: 'inactive@capital.mx', password: 'pass' }),
    ).rejects.toThrow(UserInactiveException);
  });

  it('should throw InvalidCredentialsException if password does not match', async () => {
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@capital.mx', password: 'wrong_pass' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
