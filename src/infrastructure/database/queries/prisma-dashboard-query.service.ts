import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DashboardQueryService, DashboardMetricsDto } from '../../../domain/services/dashboard-query.service.interface';

@Injectable()
export class PrismaDashboardQueryService implements DashboardQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    // KPI: Total volume, commissions, advanced amount
    const aggregates = await this.prisma.operationRecord.aggregate({
      _sum: {
        totalAmount: true,
        commission: true,
        advancedAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalVolume = Number(aggregates._sum.totalAmount || 0);
    const commissions = Number(aggregates._sum.commission || 0);
    const advancedAmount = Number(aggregates._sum.advancedAmount || 0);
    const activeOperations = aggregates._count.id;

    // KPI: Aforo promedio (advancedAmount / totalAmount)
    let averageAforo = 0;
    if (totalVolume > 0) {
      averageAforo = (advancedAmount / totalVolume) * 100;
    }

    // KPI: Clients
    const totalClients = await this.prisma.clientRecord.count();
    
    // KPI: Invoices
    const totalInvoices = await this.prisma.invoiceRecord.count();

    // Chart: Volume by month
    // We fetch all operations and group them by month in memory (since SQLite/Postgres date functions vary, doing it in memory is safest for small datasets, or we can use raw query). 
    // Since we migrated to PostgreSQL, we could use raw query, but to be simple and robust we can group in JS for this example.
    const operations = await this.prisma.operationRecord.findMany({
      select: {
        totalAmount: true,
        commission: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    const volumeByMonthMap = new Map<string, { volume: number; commission: number }>();
    operations.forEach((op: any) => {
      const month = op.createdAt.toLocaleString('es-MX', { month: 'short', year: 'numeric' });
      const current = volumeByMonthMap.get(month) || { volume: 0, commission: 0 };
      volumeByMonthMap.set(month, {
        volume: current.volume + Number(op.totalAmount),
        commission: current.commission + Number(op.commission),
      });
    });

    const volumeByMonth = Array.from(volumeByMonthMap.entries()).map(([name, data]) => ({
      name,
      volume: data.volume,
      commission: data.commission,
    }));

    // Chart: Clients by month
    const clients = await this.prisma.clientRecord.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const clientsByMonthMap = new Map<string, number>();
    clients.forEach((c: any) => {
      const month = c.createdAt.toLocaleString('es-MX', { month: 'short', year: 'numeric' });
      clientsByMonthMap.set(month, (clientsByMonthMap.get(month) || 0) + 1);
    });

    const clientsByMonth = Array.from(clientsByMonthMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      kpis: {
        totalVolume,
        commissions,
        activeOperations,
        totalClients,
        averageAforo,
        totalInvoices,
      },
      charts: {
        volumeByMonth,
        clientsByMonth,
      },
    };
  }
}
