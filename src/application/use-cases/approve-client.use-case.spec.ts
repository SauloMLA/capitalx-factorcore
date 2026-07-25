import { ApproveClientUseCase } from './approve-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientNotFoundException } from '../exceptions/client.exceptions';
import { ClientStatus } from '../../domain/enums/client-status.enum';
import { DomainException } from '../../domain/common/exceptions/domain.exception';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';

describe('ApproveClientUseCase', () => {
  let useCase: ApproveClientUseCase;
  let mockClientRepository: jest.Mocked<ClientRepository>;
  let mockAuditLogRepository: jest.Mocked<AuditLogRepository>;

  beforeEach(() => {
    mockClientRepository = {
      findById: jest.fn(),
      findByTaxId: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    } as any;
    mockAuditLogRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new ApproveClientUseCase(mockClientRepository, mockAuditLogRepository);
  });

  it('should approve a PENDING client', async () => {
    const client = Client.create('client-1', TaxId.create('XYZ850101XXX'), 'Test Corp', 'test@corp.mx');
    mockClientRepository.findById.mockResolvedValue(client);

    await useCase.execute({ clientId: client.valueId, performedBy: 'user-1' });

    expect(client.valueStatus).toBe(ClientStatus.APPROVED);
    expect(mockClientRepository.save).toHaveBeenCalledWith(client);
    expect(mockAuditLogRepository.save).toHaveBeenCalled();
  });

  it('should throw ClientNotFoundException for unknown client', async () => {
    mockClientRepository.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ clientId: 'unknown', performedBy: 'user-1' }),
    ).rejects.toBeInstanceOf(ClientNotFoundException);
  });

  it('should throw DomainException when approving an already approved client', async () => {
    const client = Client.create('client-1', TaxId.create('XYZ850101XXX'), 'Test Corp', 'test@corp.mx');
    client.approve();
    mockClientRepository.findById.mockResolvedValue(client);

    await expect(
      useCase.execute({ clientId: client.valueId, performedBy: 'user-1' }),
    ).rejects.toBeInstanceOf(DomainException);
  });
});
