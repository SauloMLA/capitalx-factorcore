import { ApproveClientUseCase } from './approve-client.use-case';
import { RegisterClientUseCase } from './register-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientNotFoundException } from '../exceptions/client.exceptions';
import { ClientStatus } from '../../domain/enums/client-status.enum';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

class FakeClientRepository implements ClientRepository {
  private store = new Map<string, Client>();
  async save(c: Client): Promise<void> { this.store.set(c.valueId, c); }
  async findById(id: string): Promise<Client | null> { return this.store.get(id) ?? null; }
  async findByTaxId(taxId: TaxId): Promise<Client | null> {
    for (const c of this.store.values()) if (c.valueTaxId.equals(taxId)) return c;
    return null;
  }
}

describe('ApproveClientUseCase', () => {
  let repo: FakeClientRepository;
  let approveUseCase: ApproveClientUseCase;

  beforeEach(async () => {
    repo = new FakeClientRepository();
    approveUseCase = new ApproveClientUseCase(repo);
    // Pre-register a client
    await new RegisterClientUseCase(repo).execute({
      id: 'client-1', rfc: 'XYZ850101XXX', name: 'Test Corp', email: 'test@corp.mx',
    });
  });

  it('should approve a PENDING client', async () => {
    await approveUseCase.execute({ clientId: 'client-1' });
    const approved = await repo.findById('client-1');
    expect(approved?.valueStatus).toBe(ClientStatus.APPROVED);
    expect(approved?.isApproved()).toBe(true);
  });

  it('should throw ClientNotFoundException for unknown client', async () => {
    await expect(
      approveUseCase.execute({ clientId: 'unknown' }),
    ).rejects.toBeInstanceOf(ClientNotFoundException);
  });

  it('should throw DomainException when approving an already approved client', async () => {
    await approveUseCase.execute({ clientId: 'client-1' });
    await expect(
      approveUseCase.execute({ clientId: 'client-1' }),
    ).rejects.toBeInstanceOf(DomainException);
  });
});
