import { GetDashboardMetricsUseCase } from './get-dashboard-metrics.use-case';
import { DashboardQueryService } from '../../domain/services/dashboard-query.service.interface';

describe('GetDashboardMetricsUseCase', () => {
  let useCase: GetDashboardMetricsUseCase;
  let mockDashboardQueryService: jest.Mocked<DashboardQueryService>;

  beforeEach(() => {
    mockDashboardQueryService = {
      getMetrics: jest.fn(),
    };

    useCase = new GetDashboardMetricsUseCase(mockDashboardQueryService);
  });

  it('should return dashboard metrics from the query service', async () => {
    const mockMetrics = {
      kpis: {
        totalVolume: 1000000,
        commissions: 50000,
        activeOperations: 10,
        totalClients: 5,
        averageAforo: 80,
        totalInvoices: 25,
      },
      charts: {
        volumeByMonth: [
          { name: 'Jan 2026', volume: 500000, commission: 25000 },
          { name: 'Feb 2026', volume: 500000, commission: 25000 },
        ],
        clientsByMonth: [
          { name: 'Jan 2026', count: 2 },
          { name: 'Feb 2026', count: 3 },
        ],
      },
    };

    mockDashboardQueryService.getMetrics.mockResolvedValue(mockMetrics);

    const result = await useCase.execute();

    expect(mockDashboardQueryService.getMetrics).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockMetrics);
  });
});
