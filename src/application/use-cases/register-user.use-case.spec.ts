import { RegisterUserUseCase, RegisterUserCommand } from './register-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../ports/password-hasher.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserAlreadyExistsException } from '../exceptions/user.exceptions';
import { User } from '../../domain/entities/user.entity';

describe('RegisterUserUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<PasswordHasher>;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
    };

    mockPasswordHasher = {
      hash: jest.fn().mockImplementation(async (pwd) => `$2b$10$hashed_${pwd}`),
      compare: jest.fn().mockResolvedValue(true),
    };

    useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  it('should register a new user successfully', async () => {
    const command: RegisterUserCommand = {
      email: 'analyst@capital.mx',
      password: 'password123',
      name: 'Carlos Analista',
      role: UserRole.ADMINISTRATOR,
    };

    const result = await useCase.execute(command);

    expect(result.id).toBeDefined();
    expect(mockUserRepository.findByEmail).toHaveBeenCalled();
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
  });

  it('should throw UserAlreadyExistsException if email is already taken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      {} as unknown as User,
    );

    const command: RegisterUserCommand = {
      email: 'existing@capital.mx',
      password: 'password123',
      name: 'Carlos Analista',
      role: UserRole.OPERATOR,
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('should throw DomainException if password is too short', async () => {
    const command: RegisterUserCommand = {
      email: 'short@capital.mx',
      password: '123',
      name: 'Short Password',
      role: UserRole.OPERATOR,
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      'Password must be at least 8 characters long',
    );
  });
});
