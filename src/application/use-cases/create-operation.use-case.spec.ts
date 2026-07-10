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

function baseCommand(overrides: Partial<CreateOperationCommand> = {}): CreateOperationCommand {
  return {
    operationId: 'op-1',
    clientId: 'client-1',
    requestDate: REQUEST_DATE,
    invoices: [
      {
        id: 'inv-1',
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

  beforeEach(async () => {
    clientRepo = new FakeClientRepository();
    operationRepo = new FakeOperationRepository();
    useCase = new CreateOperationUseCase(clientRepo, operationRepo);

    // Pre-register and approve client
    await new RegisterClientUseCase(clientRepo).execute({
      id: 'client-1', rfc: 'XYZ850101XXX', name: 'Corp', email: 'corp@mx.mx',
    });
    await new ApproveClientUseCase(clientRepo).execute({ clientId: 'client-1' });
  });

  it('should create a valid operation and return correct amounts', async () => {
    const result = await useCase.execute(baseCommand());

    expect(result.operationId).toBe('op-1');
    expect(result.totalAmount).toBe(10000);
    expect(result.advancedAmount).toBe(8500);
    expect(result.commission).toBe(150);
    expect(result.depositAmount).toBe(8350);
  });

  it('should persist the operation', async () => {
    await useCase.execute(baseCommand());
    const saved = await operationRepo.findById('op-1');
    expect(saved).not.toBeNull();
  });

  it('should throw ClientNotFoundException when client does not exist', async () => {
    await expect(
      useCase.execute(baseCommand({ clientId: 'missing' })),
    ).rejects.toBeInstanceOf(ClientNotFoundException);
  });

  it('should throw DomainException when client is not approved', async () => {
    await new RegisterClientUseCase(clientRepo).execute({
      id: 'pending-client', rfc: 'ABC010101XYZ', name: 'Pending', email: 'p@p.mx',
    });
    await expect(
      useCase.execute(baseCommand({ clientId: 'pending-client' })),
    ).rejects.toBeInstanceOf(DomainException);
  });

  it('should throw OperationValidationException and prevent save when an invoice has already been financed', async () => {
    // First operation succeeds
    await useCase.execute(baseCommand({ operationId: 'op-1' }));

    // Second operation reuses the same folio
    await expect(
      useCase.execute(baseCommand({ operationId: 'op-2' })),
    ).rejects.toBeInstanceOf(OperationValidationException);

    const notSaved = await operationRepo.findById('op-2');
    expect(notSaved).toBeNull();
  });

  it('should throw OperationValidationException and collect errors for multiple invalid invoices', async () => {
    let caught: OperationValidationException | undefined;
    try {
      await useCase.execute(baseCommand({
        operationId: 'op-bad',
        invoices: [
          {
            id: 'inv-short', folio: 'FOL-SHORT', debtorRfc: 'DEF020202ABC',
            debtorName: 'D', amount: 100, issueDate: new Date('2026-07-01T00:00:00Z'),
            dueDate: futureDate(5),  // only 5 days — fails
          },
          {
            id: 'inv-past', folio: 'FOL-PAST', debtorRfc: 'DEF020202ABC',
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
