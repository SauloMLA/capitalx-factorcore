import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

/**
 * CASO DE USO: Listar Operaciones
 * Capa: Aplicación
 *
 * Retorna todas las operaciones de factoraje incluyendo sus facturas asociadas.
 * Permite filtrar por clientId opcionalmente.
 */
@Injectable()
export class GetOperationListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(clientId?: string) {
    const operations = await this.prisma.operationRecord.findMany({
      where: clientId ? { clientId } : undefined,
      include: { invoices: true },
      orderBy: { createdAt: 'desc' },
    });

    return operations.map((op: any) => ({
      id: op.id,
      clientId: op.clientId,
      totalAmount: op.totalAmount,
      advancedAmount: op.advancedAmount,
      commission: op.commission,
      depositAmount: op.depositAmount,
      createdAt: op.createdAt.toISOString(),
      invoices: op.invoices.map((inv: any) => ({
        id: inv.id,
        operationId: inv.operationId,
        folio: inv.folio,
        debtorRfc: inv.debtorRfc,
        debtorName: inv.debtorName,
        amount: inv.amount,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        createdAt: inv.createdAt.toISOString(),
      })),
    }));
  }
}
