import { CreateOperationUseCase } from './create-operation.use-case';
import { RegisterClientUseCase } from './register-client.use-case';
import { ApproveClientUseCase } from './approve-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { Operation } from '../../domain/entities/operation.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientNotFoundException } from '../exceptions/client.exceptions';
import { OperationValidationException } from '../../domain/common/exceptions/operation-validation.exception';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

// ─── In-memory fakes ──────────────────────────────────────────────────────────

class FakeClientRepository implements ClientRepository {
  private store = new Map<string, Client>();
  async save(c: Client): Promise<void> { this.store.set(c.valueId, c); }
  async findById(id: string): Promise<Client | null> { return this.store.get(id) ?? null; }
  async findByTaxId(taxId: TaxId): Promise<Client | null> {
    for (const c of this.store.values()) if (c.valueTaxId.equals(taxId)) return c;
    return null;
  }
  async findAll(): Promise<Client[]> { return Array.from(this.store.values()); }
}

class FakeOperationRepository implements OperationRepository {
  private store = new Map<string, Operation>();
  async save(op: Operation): Promise<void> { this.store.set(op.valueId, op); }
  async findById(id: string): Promise<Operation | null> { return this.store.get(id) ?? null; }
  async findByClientId(clientId: string): Promise<Operation[]> {
    return Array.from(this.store.values()).filter(o => o.valueClientId === clientId);
  }
  async findFoliosByClientId(clientId: string): Promise<string[]> {
    const ops = await this.findByClientId(clientId);
    return ops.flatMap(o => o.valueInvoices.map(i => i.valueFolio.value));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function futureDate(days: number): Date {
  const d = new Date('2026-07-01T00:00:00Z');
  d.setDate(d.getDate() + days);
  return d;
}

const REQUEST_DATE = new Date('2026-07-01T00:00:00Z');

function baseCommand(clientId: string, overrides?: any) {
  return {
    clientId,
    requestDate: REQUEST_DATE,
    invoices: [
      {
        folio: 'FOL-001',
        debtorRfc: 'DEF020202ABC',
        debtorName: 'Deudor S.A.',
        amount: 10000,
        issueDate: new Date('2026-07-01T00:00:00Z'),
        dueDate: futureDate(30),
      },
    ],
    performedBy: 'user-1',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateOperationUseCase', () => {
  let clientRepo: FakeClientRepository;
  let operationRepo: FakeOperationRepository;
  let auditRepo: jest.Mocked<AuditLogRepository>;
  let useCase: CreateOperationUseCase;
  let clientId: string;

  beforeEach(async () => {
    clientRepo = new FakeClientRepository();
    operationRepo = new FakeOperationRepository();
    auditRepo = { save: jest.fn(), findAll: jest.fn() };
    
    // Para simplificar, instanciamos un AuditRepo fake también o lo mockeamos en los casos que no son del use case bajo test
    const dummyAuditRepo = { save: jest.fn(), findAll: jest.fn() } as any;

    useCase = new CreateOperationUseCase(clientRepo, operationRepo, auditRepo);

    // Pre-register and approve client
    const { id } = await new RegisterClientUseCase(clientRepo, dummyAuditRepo).execute({
      rfc: 'XYZ850101XXX', name: 'Corp', email: 'corp@mx.mx', performedBy: 'user-1'
    });
    clientId = id;
    await new ApproveClientUseCase(clientRepo, dummyAuditRepo).execute({ clientId, performedBy: 'user-1' });
  });

  it('should create a valid operation and return correct amounts', async () => {
    const result = await useCase.execute(baseCommand(clientId));

    expect(result.operationId).toBeDefined();
    expect(result.totalAmount).toBe(10000);
    expect(result.advancedAmount).toBe(8500);
    expect(result.commission).toBe(150);
    expect(result.depositAmount).toBe(8350);
    expect(auditRepo.save).toHaveBeenCalled();
  });

  it('should persist the operation', async () => {
    const result = await useCase.execute(baseCommand(clientId));
    const saved = await operationRepo.findById(result.operationId);
    expect(saved).not.toBeNull();
  });

  it('should throw ClientNotFoundException when client does not exist', async () => {
    try { await useCase.execute(baseCommand(clientId)); } catch(e) { console.error(e); } await expect(
      useCase.execute(baseCommand('missing')),
    ).rejects.toBeInstanceOf(ClientNotFoundException);
  });

  it('should throw DomainException when client is not approved', async () => {
    const { id: pendingId } = await new RegisterClientUseCase(clientRepo, auditRepo).execute({
      rfc: 'ABC010101XYZ', name: 'Pending', email: 'p@p.mx', performedBy: 'user-1'
    });
    try { await useCase.execute(baseCommand(clientId)); } catch(e) { console.error(e); } await expect(
      useCase.execute(baseCommand(pendingId)),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('should throw OperationValidationException and prevent save when an invoice has already been financed', async () => {
    // First operation succeeds
    await useCase.execute(baseCommand(clientId));

    // Second operation reuses the same folio
    await expect(
      useCase.execute(baseCommand(clientId)),
    ).rejects.toBeInstanceOf(OperationValidationException);
  });
});
