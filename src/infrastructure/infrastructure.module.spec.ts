import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureModule } from './infrastructure.module';
import { PrismaService } from './database/prisma.service';
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../application/use-cases/approve-client.use-case';
import { CreateOperationUseCase } from '../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../application/use-cases/get-client-summary.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';

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
});
