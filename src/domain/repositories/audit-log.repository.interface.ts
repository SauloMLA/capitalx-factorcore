import { AuditLog } from '../entities/audit-log.entity';

export interface AuditLogRepository {
  save(auditLog: AuditLog): Promise<void>;
  findAll(filters?: { entity?: string; action?: string; performedBy?: string }): Promise<AuditLog[]>;
}
