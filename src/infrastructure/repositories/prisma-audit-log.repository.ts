import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaAuditLogRepository implements AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(auditLog: AuditLog): Promise<void> {
    await this.prisma.auditLogRecord.create({
      data: {
        id: auditLog.id,
        entity: auditLog.entity,
        entityId: auditLog.entityId,
        action: auditLog.action,
        performedBy: auditLog.performedBy,
        oldValue: auditLog.oldValue,
        newValue: auditLog.newValue,
        ip: auditLog.ip,
        userAgent: auditLog.userAgent,
        timestamp: auditLog.timestamp,
      },
    });
  }

  async findAll(filters?: { entity?: string; action?: string; performedBy?: string }): Promise<AuditLog[]> {
    const where: any = {};
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.action) where.action = filters.action;
    if (filters?.performedBy) where.performedBy = filters.performedBy;

    const records = await this.prisma.auditLogRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    return records.map((record) => new AuditLog({
      id: record.id,
      entity: record.entity,
      entityId: record.entityId,
      action: record.action,
      performedBy: record.performedBy,
      oldValue: record.oldValue,
      newValue: record.newValue,
      ip: record.ip,
      userAgent: record.userAgent,
      timestamp: record.timestamp,
    }));
  }
}
