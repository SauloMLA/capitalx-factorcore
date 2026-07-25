import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { GetAuditLogsUseCase } from '../../../application/use-cases/get-audit-logs.use-case';

describe('AuditController', () => {
  let controller: AuditController;
  let useCase: jest.Mocked<GetAuditLogsUseCase>;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue([
        {
          id: 'log-1',
          entity: 'Client',
          entityId: 'client-1',
          action: 'CREATE',
          performedBy: 'user-1',
          oldValue: null,
          newValue: '{"name":"Test"}',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          timestamp: new Date(),
        }
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        { provide: GetAuditLogsUseCase, useValue: mockUseCase },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    useCase = module.get(GetAuditLogsUseCase);
  });

  it('should get audit logs and parse JSON', async () => {
    const result = await controller.findAll('Client', 'CREATE', 'user-1');
    expect(useCase.execute).toHaveBeenCalledWith({ entity: 'Client', action: 'CREATE', performedBy: 'user-1' });
    expect(result.length).toBe(1);
    expect(result[0].newValue).toEqual({ name: 'Test' });
  });
});
