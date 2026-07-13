import { RegisterClientUseCase } from './register-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientAlreadyExistsException } from '../exceptions/client.exceptions';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

// ─── In-memory fake ───────────────────────────────────────────────────────────

class FakeClientRepository implements ClientRepository {
  private store = new Map<string, Client>();

  async save(client: Client): Promise<void> {
    this.store.set(client.valueId, client);
  }
  async findById(id: string): Promise<Client | null> {
    return this.store.get(id) ?? null;
  }
  async findByTaxId(taxId: TaxId): Promise<Client | null> {
    for (const c of this.store.values()) {
      if (c.valueTaxId.equals(taxId)) return c;
    }
    return null;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegisterClientUseCase', () => {
  let repo: FakeClientRepository;
  let useCase: RegisterClientUseCase;

  beforeEach(() => {
    repo = new FakeClientRepository();
    useCase = new RegisterClientUseCase(repo);
  });

  it('should register a new client successfully', async () => {
    const { id } = await useCase.execute({
      rfc: 'XYZ850101XXX',
      name: 'Empresa ABC S.A.',
      email: 'abc@empresa.mx',
    });

    const saved = await repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved?.valueTaxId.value).toBe('XYZ850101XXX');
    expect(saved?.isApproved()).toBe(false);
  });

  it('should throw ClientAlreadyExistsException when RFC is duplicated', async () => {
    await useCase.execute({ rfc: 'XYZ850101XXX', name: 'First', email: 'a@a.mx' });
    await expect(
      useCase.execute({ rfc: 'XYZ850101XXX', name: 'Second', email: 'b@b.mx' }),
    ).rejects.toBeInstanceOf(ClientAlreadyExistsException);
  });

  it('should throw DomainException for an invalid RFC format', async () => {
    await expect(
      useCase.execute({ rfc: 'INVALID', name: 'Bad RFC', email: 'c@c.mx' }),
    ).rejects.toBeInstanceOf(DomainException);
  });
});
