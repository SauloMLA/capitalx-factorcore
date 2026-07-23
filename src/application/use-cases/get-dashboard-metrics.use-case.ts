import { Inject, Injectable } from '@nestjs/common';
import type { DashboardQueryService, DashboardMetricsDto } from '../../domain/services/dashboard-query.service.interface';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(
    @Inject('DashboardQueryService')
    private readonly dashboardQueryService: DashboardQueryService,
  ) {}

  async execute(): Promise<DashboardMetricsDto> {
    return this.dashboardQueryService.getMetrics();
  }
}
