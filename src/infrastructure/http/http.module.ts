import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { InfrastructureModule } from '../infrastructure.module';
import { ClientController } from './controllers/client.controller';
import { OperationController } from './controllers/operation.controller';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * MÓDULO HTTP
 * Capa: HTTP / Presentación (Http Layer)
 */
@Module({
  imports: [InfrastructureModule],
  controllers: [ClientController, OperationController, AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class HttpModule {}
