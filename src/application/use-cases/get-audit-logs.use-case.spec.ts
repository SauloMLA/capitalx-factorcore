import { GetAuditLogsUseCase } from './get-audit-logs.use-case';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

describe('GetAuditLogsUseCase', () => {
  let useCase: GetAuditLogsUseCase;
  let mockRepo: jest.Mocked<AuditLogRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findAll: jest.fn().mockResolvedValue([
        new AuditLog({
          id: '1',
          entity: 'Client',
          entityId: 'client-1',
          action: 'CREATE',
          performedBy: 'user-1',
          oldValue: null,
          newValue: '{}',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          timestamp: new Date(),
        })
      ]),
    };
    useCase = new GetAuditLogsUseCase(mockRepo);
  });

  it('should get audit logs with filters', async () => {
    const filters = { entity: 'Client' };
    const result = await useCase.execute(filters);
    expect(mockRepo.findAll).toHaveBeenCalledWith(filters);
    expect(result.length).toBe(1);
    expect(result[0].action).toBe('CREATE');
  });
});
