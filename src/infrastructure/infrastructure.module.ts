import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DatabaseModule } from './database/database.module';
import { REPOSITORY_TOKENS } from './tokens/repository.tokens';

import { PrismaClientRepository } from './repositories/prisma-client.repository';
import { PrismaOperationRepository } from './repositories/prisma-operation.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './repositories/prisma-refresh-token.repository';
import { PrismaDashboardQueryService } from './database/queries/prisma-dashboard-query.service';
import { PrismaService } from './database/prisma.service';

import { BcryptPasswordHasher } from './auth/bcrypt-password-hasher';
import { JwtTokenService } from './auth/jwt-token-service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

import { ClientRepository } from '../domain/repositories/client.repository.interface';
import { OperationRepository } from '../domain/repositories/operation.repository.interface';
import { UserRepository } from '../domain/repositories/user.repository.interface';
import { RefreshTokenRepository } from '../domain/repositories/refresh-token.repository.interface';
import { PasswordHasher } from '../application/ports/password-hasher.interface';
import { TokenService } from '../application/ports/token-service.interface';

// Casos de Uso
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../application/use-cases/approve-client.use-case';
import { CreateOperationUseCase } from '../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../application/use-cases/get-client-summary.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';

import { LoginUserUseCase } from '../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../application/use-cases/auth/logout-user.use-case';
import { GetCurrentUserUseCase } from '../application/use-cases/auth/get-current-user.use-case';
import { GetUsersUseCase } from '../application/use-cases/get-users.use-case';
import { GetDashboardMetricsUseCase } from '../application/use-cases/get-dashboard-metrics.use-case';
/**
 * MÓDULO DE INFRAESTRUCTURA
 * Capa: Infraestructura (Infrastructure Layer)
 */
@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [
    // Repositorios y adaptadores
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
      provide: REPOSITORY_TOKENS.REFRESH_TOKEN,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: 'DashboardQueryService',
      useClass: PrismaDashboardQueryService,
    },
    {
      provide: REPOSITORY_TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: REPOSITORY_TOKENS.TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    JwtStrategy,

    // Casos de uso
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
    {
      provide: LoginUserUseCase,
      useFactory: (
        userRepo: UserRepository,
        tokenRepo: RefreshTokenRepository,
        passwordHasher: PasswordHasher,
        tokenService: TokenService,
      ) => new LoginUserUseCase(userRepo, tokenRepo, passwordHasher, tokenService),
      inject: [
        REPOSITORY_TOKENS.USER,
        REPOSITORY_TOKENS.REFRESH_TOKEN,
        REPOSITORY_TOKENS.PASSWORD_HASHER,
        REPOSITORY_TOKENS.TOKEN_SERVICE,
      ],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (
        userRepo: UserRepository,
        tokenRepo: RefreshTokenRepository,
        tokenService: TokenService,
      ) => new RefreshTokenUseCase(userRepo, tokenRepo, tokenService),
      inject: [
        REPOSITORY_TOKENS.USER,
        REPOSITORY_TOKENS.REFRESH_TOKEN,
        REPOSITORY_TOKENS.TOKEN_SERVICE,
      ],
    },
    {
      provide: LogoutUserUseCase,
      useFactory: (
        tokenRepo: RefreshTokenRepository,
        tokenService: TokenService,
      ) => new LogoutUserUseCase(tokenRepo, tokenService),
      inject: [REPOSITORY_TOKENS.REFRESH_TOKEN, REPOSITORY_TOKENS.TOKEN_SERVICE],
    },
    {
      provide: GetCurrentUserUseCase,
      useFactory: (userRepo: UserRepository) => new GetCurrentUserUseCase(userRepo),
      inject: [REPOSITORY_TOKENS.USER],
    },
    {
      provide: GetUsersUseCase,
      useFactory: (userRepo: UserRepository) => new GetUsersUseCase(userRepo),
      inject: [REPOSITORY_TOKENS.USER],
    },
    {
      provide: GetDashboardMetricsUseCase,
      useFactory: (dashboardQueryService: any) => new GetDashboardMetricsUseCase(dashboardQueryService),
      inject: ['DashboardQueryService'],
    },
  ],
  exports: [
    RegisterClientUseCase,
    ApproveClientUseCase,
    CreateOperationUseCase,
    GetClientSummaryUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,
    GetCurrentUserUseCase,
    GetUsersUseCase,
    GetDashboardMetricsUseCase,
    REPOSITORY_TOKENS.USER,
    REPOSITORY_TOKENS.REFRESH_TOKEN,
    REPOSITORY_TOKENS.PASSWORD_HASHER,
    REPOSITORY_TOKENS.TOKEN_SERVICE,
  ],
})
export class InfrastructureModule {}
