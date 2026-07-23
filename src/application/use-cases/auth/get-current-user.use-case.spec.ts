import { GetCurrentUserUseCase } from './get-current-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../../domain/common/value-objects/password-hash.value-object';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserNotFoundException } from '../../exceptions/user.exceptions';
import { UserInactiveException } from '../../exceptions/auth.exceptions';

describe('GetCurrentUserUseCase', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;
  let useCase: GetCurrentUserUseCase;

  const activeUser = User.create(
    'usr-1',
    Email.create('user@capital.mx'),
    PasswordHash.create('hashed'),
    'Carlos Analista',
    UserRole.ADMINISTRATOR,
  );

  beforeEach(() => {
    mockUserRepo = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(activeUser),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new GetCurrentUserUseCase(mockUserRepo);
  });

  it('should return user details when user exists and is active', async () => {
    const result = await useCase.execute('usr-1');

    expect(result.id).toBe('usr-1');
    expect(result.email).toBe('user@capital.mx');
    expect(result.role).toBe(UserRole.ADMINISTRATOR);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(UserNotFoundException);
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
    mockUserRepo.findById.mockResolvedValue(inactiveUser);

    await expect(useCase.execute('usr-2')).rejects.toThrow(UserInactiveException);
  });
});
