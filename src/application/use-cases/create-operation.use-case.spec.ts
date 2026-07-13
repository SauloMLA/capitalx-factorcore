import { CreateOperationUseCase, CreateOperationCommand } from './create-operation.use-case';
import { RegisterClientUseCase } from './register-client.use-case';
import { ApproveClientUseCase } from './approve-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { Operation } from '../../domain/entities/operation.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientNotFoundException } from '../exceptions/client.exceptions';
import { DomainException } from '../../domain/common/exceptions/domain.exception';
import { OperationValidationException } from '../../domain/common/exceptions/operation-validation.exception';

// ─── Fakes ────────────────────────────────────────────────────────────────────

class FakeClientRepository implements ClientRepository {
  private store = new Map<string, Client>();
  async save(c: Client): Promise<void> { this.store.set(c.valueId, c); }
  async findById(id: string): Promise<Client | null> { return this.store.get(id) ?? null; }
  async findByTaxId(taxId: TaxId): Promise<Client | null> {
    for (const c of this.store.values()) if (c.valueTaxId.equals(taxId)) return c;
    return null;
  }
}

class FakeOperationRepository implements OperationRepository {
  private store = new Map<string, Operation>();
  async save(op: Operation): Promise<void> { this.store.set(op.valueId, op); }
  async findById(id: string): Promise<Operation | null> { return this.store.get(id) ?? null; }
  async findFoliosByClientId(clientId: string): Promise<string[]> {
    const folios: string[] = [];
    for (const op of this.store.values()) {
      if (op.valueClientId === clientId) {
        for (const inv of op.valueInvoices) folios.push(inv.valueFolio.value);
      }
    }
    return folios;
  }
  async findByClientId(clientId: string): Promise<Operation[]> {
    return [...this.store.values()].filter(op => op.valueClientId === clientId);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REQUEST_DATE = new Date('2026-07-10T12:00:00Z');

function futureDate(daysAhead: number): Date {
  const d = new Date(REQUEST_DATE);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

function baseCommand(clientId: string, overrides: Partial<CreateOperationCommand> = {}): CreateOperationCommand {
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
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateOperationUseCase', () => {
  let clientRepo: FakeClientRepository;
  let operationRepo: FakeOperationRepository;
  let useCase: CreateOperationUseCase;
  let clientId: string;

  beforeEach(async () => {
    clientRepo = new FakeClientRepository();
    operationRepo = new FakeOperationRepository();
    useCase = new CreateOperationUseCase(clientRepo, operationRepo);

    // Pre-register and approve client
    const { id } = await new RegisterClientUseCase(clientRepo).execute({
      rfc: 'XYZ850101XXX', name: 'Corp', email: 'corp@mx.mx',
    });
    clientId = id;
    await new ApproveClientUseCase(clientRepo).execute({ clientId });
  });

  it('should create a valid operation and return correct amounts', async () => {
    const result = await useCase.execute(baseCommand(clientId));

    expect(result.operationId).toBeDefined();
    expect(result.totalAmount).toBe(10000);
    expect(result.advancedAmount).toBe(8500);
    expect(result.commission).toBe(150);
    expect(result.depositAmount).toBe(8350);
  });

  it('should persist the operation', async () => {
    const result = await useCase.execute(baseCommand(clientId));
    const saved = await operationRepo.findById(result.operationId);
    expect(saved).not.toBeNull();
  });

  it('should throw ClientNotFoundException when client does not exist', async () => {
    await expect(
      useCase.execute(baseCommand(clientId, { clientId: 'missing' })),
    ).rejects.toBeInstanceOf(ClientNotFoundException);
  });

  it('should throw DomainException when client is not approved', async () => {
    const { id: pendingId } = await new RegisterClientUseCase(clientRepo).execute({
      rfc: 'ABC010101XYZ', name: 'Pending', email: 'p@p.mx',
    });
    await expect(
      useCase.execute(baseCommand(clientId, { clientId: pendingId })),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('should throw OperationValidationException and prevent save when an invoice has already been financed', async () => {
    // First operation succeeds
    const result = await useCase.execute(baseCommand(clientId));

    // Second operation reuses the same folio
    await expect(
      useCase.execute(baseCommand(clientId)),
    ).rejects.toBeInstanceOf(OperationValidationException);
  });

  it('should throw OperationValidationException and collect errors for multiple invalid invoices', async () => {
    let caught: OperationValidationException | undefined;
    try {
      await useCase.execute(baseCommand(clientId, {
        invoices: [
          {
            folio: 'FOL-SHORT', debtorRfc: 'DEF020202ABC',
            debtorName: 'D', amount: 100, issueDate: new Date('2026-07-01T00:00:00Z'),
            dueDate: futureDate(5),  // only 5 days — fails
          },
          {
            folio: 'FOL-PAST', debtorRfc: 'DEF020202ABC',
            debtorName: 'D', amount: 100,
            issueDate: new Date('2025-01-01T00:00:00Z'),
            dueDate: new Date('2025-01-10T00:00:00Z'), // already past — fails
          },
        ],
      }));
    } catch (e) { caught = e as OperationValidationException; }

    expect(caught).toBeInstanceOf(OperationValidationException);
    expect(caught?.errors.length).toBeGreaterThanOrEqual(2);
  });
});
