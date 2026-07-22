import { Injectable } from '@nestjs/common';
import { Operation } from '../../domain/entities/operation.entity';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { PrismaService } from '../database/prisma.service';
import { OperationMapper } from '../mappers/operation.mapper';

/**
 * REPOSITORIO CONCRETO DE OPERACIONES (PRISMA)
 * Capa: Infraestructura (Infrastructure Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Implementar la interfaz `OperationRepository` usando Prisma y SQLite.
 * Guarda operaciones y sus facturas asociadas garantizando atomicidad transaccional 
 * (o se guarda todo el lote de facturas o no se guarda nada).
 */
@Injectable()
export class PrismaOperationRepository implements OperationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Guarda la operación y su lote de facturas de forma atómica en SQLite
  async save(operation: Operation): Promise<void> {
    // 1. Traduce el Agregado de Dominio a registros planos compatibles con las tablas de la BD
    const { operationRecord, invoiceRecords } = OperationMapper.toPersistence(operation);

    // 2. Ejecuta una transacción atómica ($transaction) para asegurar consistencia
    await this.prisma.$transaction(async (tx) => {
      // Guarda o actualiza los datos generales de la operación
      await tx.operationRecord.upsert({
        where: { id: operationRecord.id },
        create: operationRecord,
        update: operationRecord,
      });

      // Estrategia segura para facturas:
      // Como las facturas son inmutables una vez financiadas, borramos las facturas previas
      // asociadas a esta operación e insertamos el nuevo lote limpio de golpe.
      await tx.invoiceRecord.deleteMany({ where: { operationId: operationRecord.id } });
      await tx.invoiceRecord.createMany({ data: invoiceRecords });
    });
  }

  // Busca una operación por su ID e incluye sus facturas (JOIN en SQL)
  async findById(id: string): Promise<Operation | null> {
    const record = await this.prisma.operationRecord.findUnique({
      where: { id },
      include: { invoices: true }, // Trae las facturas asociadas en la misma consulta
    });
    if (!record) return null;
    return OperationMapper.toDomain(record);
  }

  // Busca todos los folios de facturas ya financiados por el cliente (para validación de duplicados)
  async findFoliosByClientId(clientId: string): Promise<string[]> {
    const invoices = await this.prisma.invoiceRecord.findMany({
      where: { operation: { clientId } },
      select: { folio: true }, // Solo selecciona la columna 'folio' para ahorrar memoria
    });
    return invoices.map((inv) => inv.folio);
  }

  // Obtiene el historial completo de operaciones de un cliente con sus facturas incluidas
  async findByClientId(clientId: string): Promise<Operation[]> {
    const records = await this.prisma.operationRecord.findMany({
      where: { clientId },
      include: { invoices: true },
    });
    // Convierte el array de registros planos a un array de entidades del dominio
    return records.map((r) => OperationMapper.toDomain(r));
  }
}
