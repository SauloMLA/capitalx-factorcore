import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { PasswordHasher } from '../ports/password-hasher.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserAlreadyExistsException } from '../exceptions/user.exceptions';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<PasswordHasher>;
  let mockAuditLogRepository: jest.Mocked<AuditLogRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    mockAuditLogRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasher, mockAuditLogRepository);
  });

  it('should register a new user successfully', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue('hashed-pwd');

    const result = await useCase.execute({
      email: 'admin@factorx.com',
      password: 'password123',
      name: 'Admin User',
      role: UserRole.ADMINISTRATOR,
      performedBy: 'user-1',
    });

    expect(result.id).toBeDefined();
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    expect(mockAuditLogRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw UserAlreadyExistsException if email is taken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({} as any);

    await expect(
      useCase.execute({
        email: 'taken@factorx.com',
        password: 'password123',
        name: 'Taken User',
        role: UserRole.OPERATOR,
        performedBy: 'user-1',
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsException);
  });

  it('should throw DomainException if password is too short', async () => {
    await expect(
      useCase.execute({
        email: 'admin@factorx.com',
        password: 'short',
        name: 'Admin User',
        role: UserRole.ADMINISTRATOR,
        performedBy: 'user-1',
      })
    ).rejects.toBeInstanceOf(DomainException);
  });
});
