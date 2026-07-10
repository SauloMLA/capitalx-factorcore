import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { REPOSITORY_TOKENS } from './tokens/repository.tokens';
import { PrismaClientRepository } from './repositories/prisma-client.repository';
import { PrismaOperationRepository } from './repositories/prisma-operation.repository';
import { ClientRepository } from '../domain/repositories/client.repository.interface';
import { OperationRepository } from '../domain/repositories/operation.repository.interface';

// Use Cases
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../application/use-cases/approve-client.use-case';
import { CreateOperationUseCase } from '../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../application/use-cases/get-client-summary.use-case';

@Module({
  imports: [DatabaseModule],
  providers: [
    // Repository Bindings
    {
      provide: REPOSITORY_TOKENS.CLIENT,
      useClass: PrismaClientRepository,
    },
    {
      provide: REPOSITORY_TOKENS.OPERATION,
      useClass: PrismaOperationRepository,
    },

    // Use Case Factory Providers (keeps Application Layer free of NestJS dependency injection decorators)
    {
      provide: RegisterClientUseCase,
      useFactory: (clientRepo: ClientRepository) => new RegisterClientUseCase(clientRepo),
      inject: [REPOSITORY_TOKENS.CLIENT],
    },
    {
      provide: ApproveClientUseCase,
      useFactory: (clientRepo: ClientRepository) => new ApproveClientUseCase(clientRepo),
      inject: [REPOSITORY_TOKENS.CLIENT],
    },
    {
      provide: CreateOperationUseCase,
      useFactory: (clientRepo: ClientRepository, operationRepo: OperationRepository) =>
        new CreateOperationUseCase(clientRepo, operationRepo),
      inject: [REPOSITORY_TOKENS.CLIENT, REPOSITORY_TOKENS.OPERATION],
    },
    {
      provide: GetClientSummaryUseCase,
      useFactory: (clientRepo: ClientRepository, operationRepo: OperationRepository) =>
        new GetClientSummaryUseCase(clientRepo, operationRepo),
      inject: [REPOSITORY_TOKENS.CLIENT, REPOSITORY_TOKENS.OPERATION],
    },
  ],
  exports: [
    RegisterClientUseCase,
    ApproveClientUseCase,
    CreateOperationUseCase,
    GetClientSummaryUseCase,
  ],
})
export class InfrastructureModule {}
