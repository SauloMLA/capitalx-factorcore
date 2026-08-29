import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../../../application/use-cases/auth/logout-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/get-current-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUserUseCase>;
  let refreshUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUserUseCase>;
  let getMeUseCase: jest.Mocked<GetCurrentUserUseCase>;
  let registerUseCase: jest.Mocked<RegisterUserUseCase>;

  beforeEach(async () => {
    const mockLoginUseCase = { execute: jest.fn().mockResolvedValue({ accessToken: 'a', refreshToken: 'r' }) };
    const mockRefreshUseCase = { execute: jest.fn().mockResolvedValue({ accessToken: 'na', refreshToken: 'nr' }) };
    const mockLogoutUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const mockGetMeUseCase = { execute: jest.fn().mockResolvedValue({ id: 'me' }) };
    const mockRegisterUseCase = { execute: jest.fn().mockResolvedValue({ id: 'new-user' }) };

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
    loginUseCase = module.get(LoginUserUseCase);
    refreshUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUserUseCase);
    getMeUseCase = module.get(GetCurrentUserUseCase);
    registerUseCase = module.get(RegisterUserUseCase);
  });

  it('should login and set cookie', async () => {
    const res = { cookie: jest.fn() } as any;
    const result = await controller.login({ email: 'test@test.com', password: '123' }, res);
    expect(result.accessToken).toBe('a');
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'r', expect.any(Object));
  });

  it('should refresh using cookie', async () => {
    const req = { cookies: { refresh_token: 'old_r' } } as any;
    const res = { cookie: jest.fn() } as any;
    await controller.refresh(req, {} as any, res);
    expect(refreshUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'old_r' });
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'nr', expect.any(Object));
  });

  it('should logout and clear cookie', async () => {
    const req = { cookies: { refresh_token: 'r' } } as any;
    const res = { clearCookie: jest.fn() } as any;
    await controller.logout(req, {} as any, res);
    expect(logoutUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'r' });
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object));
  });

  it('should get me', async () => {
    const result = await controller.getMe({ sub: 'user-1' } as any);
    expect(result.id).toBe('me');
    expect(getMeUseCase.execute).toHaveBeenCalledWith('user-1');
  });

  it('should register using sub from JWT for performedBy', async () => {
    const result = await controller.register({ email: 'test@test.com', name: 'T', password: '123', role: 'OPERATOR' as any }, { user: { sub: 'test-user-1' }, headers: {}, ip: '127.0.0.1' } as any);
    expect(result.id).toBe('new-user');
    expect(registerUseCase.execute).toHaveBeenCalledWith({ email: 'test@test.com', name: 'T', password: '123', role: 'OPERATOR', performedBy: 'test-user-1', ip: '127.0.0.1', userAgent: undefined });
  });
});
