import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../../../application/use-cases/auth/logout-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/get-current-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let mockLoginUseCase: any;
  let mockRefreshUseCase: any;
  let mockLogoutUseCase: any;
  let mockGetMeUseCase: any;
  let mockRegisterUseCase: any;

  beforeEach(async () => {
    mockLoginUseCase = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'access_xyz',
        refreshToken: 'refresh_xyz',
        user: { id: 'usr-1', email: 'user@capital.mx', name: 'User', role: UserRole.ADMINISTRATOR, clientId: null },
      }),
    };
    mockRefreshUseCase = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'new_access_xyz',
        refreshToken: 'new_refresh_xyz',
        user: { id: 'usr-1', email: 'user@capital.mx', name: 'User', role: UserRole.ADMINISTRATOR, clientId: null },
      }),
    };
    mockLogoutUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    mockGetMeUseCase = { execute: jest.fn().mockResolvedValue({ id: 'usr-1', email: 'user@capital.mx' }) };
    mockRegisterUseCase = { execute: jest.fn().mockResolvedValue({ id: 'usr-1' }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUserUseCase, useValue: mockLoginUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshUseCase },
        { provide: LogoutUserUseCase, useValue: mockLogoutUseCase },
        { provide: GetCurrentUserUseCase, useValue: mockGetMeUseCase },
        { provide: RegisterUserUseCase, useValue: mockRegisterUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should call loginUserUseCase and set cookie on login', async () => {
    const resMock: any = { cookie: jest.fn() };
    const result = await controller.login(
      { email: 'user@capital.mx', password: 'password123' },
      resMock,
    );

    expect(result.accessToken).toBe('access_xyz');
    expect(resMock.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh_xyz',
      expect.any(Object),
    );
  });

  it('should call getMe for authenticated user', async () => {
    const result = await controller.getMe({
      sub: 'usr-1',
      email: 'user@capital.mx',
      role: UserRole.ADMINISTRATOR,
      clientId: null,
    });

    expect(result.id).toBe('usr-1');
  });
});
