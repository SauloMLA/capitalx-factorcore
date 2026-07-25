import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verifica el estado de salud del servicio y la base de datos' })
  @ApiResponse({ status: 200, description: 'Servicio operando normalmente' })
  async check() {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'financial-api',
      database: dbStatus,
      uptime: process.uptime(),
    };
  }
}
