import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

export class GetAuditLogsUseCase {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async execute(filters?: { entity?: string; action?: string; performedBy?: string }): Promise<AuditLog[]> {
    return await this.auditLogRepository.findAll(filters);
  }
}
