import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserResponseDto } from '../../../application/use-cases/get-users.use-case';

describe('UserController', () => {
  let controller: UserController;
  let mockGetUsersUseCase: jest.Mocked<GetUsersUseCase>;

  beforeEach(async () => {
    mockGetUsersUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetUsersUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: GetUsersUseCase,
          useValue: mockGetUsersUseCase,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockUsers: UserResponseDto[] = [
        {
          id: 'usr_1',
          email: 'admin@example.com',
          name: 'Admin',
          role: UserRole.ADMINISTRATOR,
          isActive: true,
          clientId: null,
          createdAt: new Date(),
        },
      ];

      mockGetUsersUseCase.execute.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(mockGetUsersUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });
  });
});
