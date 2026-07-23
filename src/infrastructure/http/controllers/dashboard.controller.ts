import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetDashboardMetricsUseCase } from '../../../application/use-cases/get-dashboard-metrics.use-case';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { DashboardMetricsDto } from '../../../domain/services/dashboard-query.service.interface';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase) {}

  @Get('metrics')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Obtener métricas y KPIs para el dashboard' })
  @ApiResponse({ status: 200, description: 'Métricas obtenidas exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async getMetrics(): Promise<DashboardMetricsDto> {
    return this.getDashboardMetricsUseCase.execute();
  }
}
