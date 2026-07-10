import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure.module';
import { ClientController } from './controllers/client.controller';
import { OperationController } from './controllers/operation.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [ClientController, OperationController],
})
export class HttpModule {}
