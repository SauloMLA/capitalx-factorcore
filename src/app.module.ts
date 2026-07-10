import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { HttpModule } from './infrastructure/http/http.module';

@Module({
  imports: [InfrastructureModule, HttpModule],
})
export class AppModule {}


