import { Injectable } from '@nestjs/common';
import { Operation } from '../../domain/entities/operation.entity';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { PrismaService } from '../database/prisma.service';
import { OperationMapper } from '../mappers/operation.mapper';

@Injectable()
export class PrismaOperationRepository implements OperationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(operation: Operation): Promise<void> {
    const { operationRecord, invoiceRecords } = OperationMapper.toPersistence(operation);

    await this.prisma.$transaction(async (tx) => {
      await tx.operationRecord.upsert({
        where: { id: operationRecord.id },
        create: operationRecord,
        update: operationRecord,
      });

      // Delete and re-insert invoices so upsert logic remains simple
      // Invoices are immutable after creation, so this is safe.
      await tx.invoiceRecord.deleteMany({ where: { operationId: operationRecord.id } });
      await tx.invoiceRecord.createMany({ data: invoiceRecords });
    });
  }

  async findById(id: string): Promise<Operation | null> {
    const record = await this.prisma.operationRecord.findUnique({
      where: { id },
      include: { invoices: true },
    });
    if (!record) return null;
    return OperationMapper.toDomain(record);
  }

  async findFoliosByClientId(clientId: string): Promise<string[]> {
    const invoices = await this.prisma.invoiceRecord.findMany({
      where: { operation: { clientId } },
      select: { folio: true },
    });
    return invoices.map((inv) => inv.folio);
  }

  async findByClientId(clientId: string): Promise<Operation[]> {
    const records = await this.prisma.operationRecord.findMany({
      where: { clientId },
      include: { invoices: true },
    });
    return records.map(OperationMapper.toDomain);
  }
}
