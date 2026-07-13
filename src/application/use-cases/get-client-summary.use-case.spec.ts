import { GetClientSummaryUseCase } from './get-client-summary.use-case';
import { RegisterClientUseCase } from './register-client.use-case';
import { ApproveClientUseCase } from './approve-client.use-case';
import { CreateOperationUseCase } from './create-operation.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { Operation } from '../../domain/entities/operation.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

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
      if (op.valueClientId === clientId)
        for (const inv of op.valueInvoices) folios.push(inv.valueFolio.value);
    }
    return folios;
  }
  async findByClientId(clientId: string): Promise<Operation[]> {
    return [...this.store.values()].filter(op => op.valueClientId === clientId);
  }
}

const REQUEST_DATE = new Date('2026-07-10T12:00:00Z');

function futureDate(daysAhead: number): Date {
  const d = new Date(REQUEST_DATE);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

describe('GetClientSummaryUseCase', () => {
  let clientRepo: FakeClientRepository;
  let operationRepo: FakeOperationRepository;
  let summaryUseCase: GetClientSummaryUseCase;
  let clientId: string;

  beforeEach(async () => {
    clientRepo = new FakeClientRepository();
    operationRepo = new FakeOperationRepository();
    summaryUseCase = new GetClientSummaryUseCase(clientRepo, operationRepo);

    const { id } = await new RegisterClientUseCase(clientRepo).execute({
      rfc: 'XYZ850101XXX', name: 'Corp', email: 'corp@mx.mx',
    });
    clientId = id;
    await new ApproveClientUseCase(clientRepo).execute({ clientId });

    const createOp = new CreateOperationUseCase(clientRepo, operationRepo);

    await createOp.execute({
      clientId, requestDate: REQUEST_DATE,
      invoices: [{
        folio: 'FOL-001', debtorRfc: 'DEF020202ABC',
        debtorName: 'Debtor', amount: 10000,
        issueDate: new Date('2026-07-01T00:00:00Z'), dueDate: futureDate(30),
      }],
    });

    await createOp.execute({
      clientId, requestDate: REQUEST_DATE,
      invoices: [{
        folio: 'FOL-002', debtorRfc: 'DEF020202ABC',
        debtorName: 'Debtor', amount: 20000,
        issueDate: new Date('2026-07-01T00:00:00Z'), dueDate: futureDate(15),
      }],
    });
  });

  it('should return correct operation count', async () => {
    const summary = await summaryUseCase.execute(clientId);
    expect(summary.operationCount).toBe(2);
  });

  it('should return accumulated advanced amount for all operations', async () => {
    const summary = await summaryUseCase.execute(clientId);
    // op-1: 10000 × 0.85 = 8500 | op-2: 20000 × 0.85 = 17000 → total = 25500
    expect(summary.totalAdvancedAmount).toBe(25500);
  });

  it('should return the nearest due date across all invoices', async () => {
    const summary = await summaryUseCase.execute(clientId);
    // FOL-002 is due in 15 days, FOL-001 in 30 days → nearest is FOL-002
    expect(summary.nearestDueDate?.getTime()).toBe(futureDate(15).getTime());
  });

  it('should return null nearestDueDate when client has no operations', async () => {
    const { id: client2Id } = await new RegisterClientUseCase(clientRepo).execute({
      rfc: 'GHI030303DEF', name: 'Empty Corp', email: 'e@e.mx',
    });
    const summary = await summaryUseCase.execute(client2Id);
    expect(summary.operationCount).toBe(0);
    expect(summary.nearestDueDate).toBeNull();
  });

  it('should throw ClientNotFoundException for unknown client', async () => {
    await expect(summaryUseCase.execute('missing')).rejects.toBeInstanceOf(ClientNotFoundException);
  });
});
