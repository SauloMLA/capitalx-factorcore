import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureModule } from './infrastructure.module';
import { PrismaService } from './database/prisma.service';
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../application/use-cases/approve-client.use-case';
import { CreateOperationUseCase } from '../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../application/use-cases/get-client-summary.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../application/use-cases/auth/logout-user.use-case';
import { GetCurrentUserUseCase } from '../application/use-cases/auth/get-current-user.use-case';

describe('InfrastructureModule Dependency Injection Wiring', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    const prismaMock = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };

    moduleRef = await Test.createTestingModule({
      imports: [InfrastructureModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should compile the module successfully', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should resolve RegisterClientUseCase', () => {
    const useCase = moduleRef.get<RegisterClientUseCase>(RegisterClientUseCase);
    expect(useCase).toBeInstanceOf(RegisterClientUseCase);
  });

  it('should resolve ApproveClientUseCase', () => {
    const useCase = moduleRef.get<ApproveClientUseCase>(ApproveClientUseCase);
    expect(useCase).toBeInstanceOf(ApproveClientUseCase);
  });

  it('should resolve CreateOperationUseCase', () => {
    const useCase = moduleRef.get<CreateOperationUseCase>(CreateOperationUseCase);
    expect(useCase).toBeInstanceOf(CreateOperationUseCase);
  });

  it('should resolve GetClientSummaryUseCase', () => {
    const useCase = moduleRef.get<GetClientSummaryUseCase>(GetClientSummaryUseCase);
    expect(useCase).toBeInstanceOf(GetClientSummaryUseCase);
  });

  it('should resolve RegisterUserUseCase', () => {
    const useCase = moduleRef.get<RegisterUserUseCase>(RegisterUserUseCase);
    expect(useCase).toBeInstanceOf(RegisterUserUseCase);
  });

  it('should resolve LoginUserUseCase', () => {
    const useCase = moduleRef.get<LoginUserUseCase>(LoginUserUseCase);
    expect(useCase).toBeInstanceOf(LoginUserUseCase);
  });

  it('should resolve RefreshTokenUseCase', () => {
    const useCase = moduleRef.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    expect(useCase).toBeInstanceOf(RefreshTokenUseCase);
  });

  it('should resolve LogoutUserUseCase', () => {
    const useCase = moduleRef.get<LogoutUserUseCase>(LogoutUserUseCase);
    expect(useCase).toBeInstanceOf(LogoutUserUseCase);
  });

  it('should resolve GetCurrentUserUseCase', () => {
    const useCase = moduleRef.get<GetCurrentUserUseCase>(GetCurrentUserUseCase);
    expect(useCase).toBeInstanceOf(GetCurrentUserUseCase);
  });
});
