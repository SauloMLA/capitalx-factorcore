import { GetUsersUseCase } from './get-users.use-case';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { Email } from '../../domain/common/value-objects/email.value-object';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new GetUsersUseCase(mockUserRepository);
  });

  it('should return a list of users without their password hashes', async () => {
    const user1 = User.reconstitute(
      'usr_1',
      Email.create('admin@example.com'),
      { value: 'hashed123' } as any,
      'Admin User',
      UserRole.ADMINISTRATOR,
      true,
      null,
      new Date('2024-01-01T00:00:00Z'),
    );

    const user2 = User.reconstitute(
      'usr_2',
      Email.create('operator@example.com'),
      { value: 'hashed456' } as any,
      'Operator User',
      UserRole.OPERATOR,
      true,
      'cli_1',
      new Date('2024-01-02T00:00:00Z'),
    );

    mockUserRepository.findAll.mockResolvedValue([user1, user2]);

    const result = await useCase.execute();

    expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      id: 'usr_1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      clientId: null,
      createdAt: user1.valueCreatedAt,
    });
    
    expect((result[0] as any).passwordHash).toBeUndefined();

    expect(result[1]).toEqual({
      id: 'usr_2',
      email: 'operator@example.com',
      name: 'Operator User',
      role: UserRole.OPERATOR,
      isActive: true,
      clientId: 'cli_1',
      createdAt: user2.valueCreatedAt,
    });
  });
});
