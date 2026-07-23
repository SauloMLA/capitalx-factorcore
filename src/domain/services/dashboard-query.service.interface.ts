export interface DashboardMetricsDto {
  kpis: {
    totalVolume: number;
    commissions: number;
    activeOperations: number;
    totalClients: number;
    averageAforo: number;
    totalInvoices: number;
  };
  charts: {
    volumeByMonth: { name: string; volume: number; commission: number }[];
    clientsByMonth: { name: string; count: number }[];
  };
}

export interface DashboardQueryService {
  getMetrics(): Promise<DashboardMetricsDto>;
}
