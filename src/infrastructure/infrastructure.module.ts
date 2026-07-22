import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { REPOSITORY_TOKENS } from './tokens/repository.tokens';
import { PrismaClientRepository } from './repositories/prisma-client.repository';
import { PrismaOperationRepository } from './repositories/prisma-operation.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { BcryptPasswordHasher } from './auth/bcrypt-password-hasher';
import { ClientRepository } from '../domain/repositories/client.repository.interface';
import { OperationRepository } from '../domain/repositories/operation.repository.interface';
import { UserRepository } from '../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../application/ports/password-hasher.interface';

// Casos de Uso
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../application/use-cases/approve-client.use-case';
import { CreateOperationUseCase } from '../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../application/use-cases/get-client-summary.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';

/**
 * MÓDULO DE INFRAESTRUCTURA
 * Capa: Infraestructura (Infrastructure Layer)
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    // 1. Vinculación de Repositorios y Servicios de Infraestructura:
    {
      provide: REPOSITORY_TOKENS.CLIENT,
      useClass: PrismaClientRepository,
    },
    {
      provide: REPOSITORY_TOKENS.OPERATION,
      useClass: PrismaOperationRepository,
    },
    {
      provide: REPOSITORY_TOKENS.USER,
      useClass: PrismaUserRepository,
    },
    {
      provide: REPOSITORY_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },

    // 2. Factory Providers para los Casos de Uso:
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
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo: UserRepository, passwordHasher: PasswordHasher) =>
        new RegisterUserUseCase(userRepo, passwordHasher),
      inject: [REPOSITORY_TOKENS.USER, REPOSITORY_TOKENS.PASSWORD_HASHER],
    },
  ],
  exports: [
    RegisterClientUseCase,
    ApproveClientUseCase,
    CreateOperationUseCase,
    GetClientSummaryUseCase,
    RegisterUserUseCase,
    REPOSITORY_TOKENS.USER,
    REPOSITORY_TOKENS.PASSWORD_HASHER,
  ],
})
export class InfrastructureModule {}
