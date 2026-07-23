import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { InfrastructureModule } from '../infrastructure.module';
import { ClientController } from './controllers/client.controller';
import { OperationController } from './controllers/operation.controller';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * MÓDULO HTTP
 * Capa: HTTP / Presentación (Http Layer)
 */
@Module({
  imports: [InfrastructureModule],
  controllers: [ClientController, OperationController, AuthController, UserController, DashboardController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class HttpModule {}
