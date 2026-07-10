import { PrismaOperationRepository } from './prisma-operation.repository';
import { PrismaService } from '../database/prisma.service';
import { OperationMapper } from '../mappers/operation.mapper';
import { Operation } from '../../domain/entities/operation.entity';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceFolio } from '../../domain/common/value-objects/invoice-folio.value-object';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { Money } from '../../domain/common/value-objects/money.value-object';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOW       = new Date('2026-07-10T00:00:00Z');
const ISSUE     = new Date('2026-07-01T00:00:00Z');
const DUE       = new Date('2026-08-10T00:00:00Z');

const OPERATION_RECORD = {
  id: 'op-1',
  clientId: 'client-1',
  totalAmount: 10000,
  advancedAmount: 8500,
  commission: 150,
  depositAmount: 8350,
  createdAt: NOW,
  invoices: [
    {
      id: 'inv-1', operationId: 'op-1', folio: 'FOL-001',
      debtorRfc: 'DEF020202ABC', debtorName: 'Deudor S.A.',
      amount: 10000, issueDate: ISSUE, dueDate: DUE, createdAt: NOW,
    },
  ],
};

function buildOperation(): Operation {
  const inv = Invoice.reconstitute(
    'inv-1', InvoiceFolio.create('FOL-001'), TaxId.create('DEF020202ABC'),
    'Deudor S.A.', Money.create(10000), ISSUE, DUE,
  );
  return Operation.reconstitute(
    'op-1', 'client-1', [inv],
    Money.create(10000), Money.create(8500), Money.create(150), Money.create(8350),
  );
}

function mockTx() {
  return {
    operationRecord: { upsert: jest.fn().mockResolvedValue(undefined) },
    invoiceRecord: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue(undefined),
    },
  };
}

function mockPrisma(overrides: Record<string, unknown> = {}) {
  const tx = mockTx();
  return {
    $transaction: jest.fn().mockImplementation((fn: (tx: typeof tx) => Promise<void>) => fn(tx)),
    operationRecord: {
      upsert: jest.fn().mockResolvedValue(undefined),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    invoiceRecord: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    ...overrides,
    _tx: tx,
  } as unknown as PrismaService & { _tx: ReturnType<typeof mockTx> };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PrismaOperationRepository', () => {
  it('should execute save inside a transaction', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaOperationRepository(prisma);
    await repo.save(buildOperation());
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should call upsert and delete+createMany inside the transaction', async () => {
    const prisma = mockPrisma();
    const tx = (prisma as unknown as { _tx: ReturnType<typeof mockTx> })._tx;
    const repo = new PrismaOperationRepository(prisma);
    await repo.save(buildOperation());

    expect(tx.operationRecord.upsert).toHaveBeenCalledTimes(1);
    expect(tx.invoiceRecord.deleteMany).toHaveBeenCalledWith({ where: { operationId: 'op-1' } });
    expect(tx.invoiceRecord.createMany).toHaveBeenCalledTimes(1);
  });

  it('should return null from findById when prisma returns null', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaOperationRepository(prisma);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('should reconstruct an Operation from findById', async () => {
    const prisma = mockPrisma({
      operationRecord: {
        findUnique: jest.fn().mockResolvedValue(OPERATION_RECORD),
        findMany: jest.fn().mockResolvedValue([]),
      },
    });
    const repo = new PrismaOperationRepository(prisma);
    const op = await repo.findById('op-1');

    expect(op).not.toBeNull();
    expect(op!.valueId).toBe('op-1');
    expect(op!.valueTotalAmount.value).toBe(10000);
    expect(op!.valueInvoices).toHaveLength(1);
  });

  it('should return empty array from findFoliosByClientId when no invoices exist', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaOperationRepository(prisma);
    const folios = await repo.findFoliosByClientId('client-1');
    expect(folios).toEqual([]);
  });

  it('should extract folios correctly from findFoliosByClientId', async () => {
    const prisma = mockPrisma({
      invoiceRecord: {
        findMany: jest.fn().mockResolvedValue([{ folio: 'FOL-001' }, { folio: 'FOL-002' }]),
      },
    });
    const repo = new PrismaOperationRepository(prisma);
    const folios = await repo.findFoliosByClientId('client-1');
    expect(folios).toEqual(['FOL-001', 'FOL-002']);
  });

  it('should return empty array from findByClientId when no operations exist', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaOperationRepository(prisma);
    const ops = await repo.findByClientId('client-1');
    expect(ops).toEqual([]);
  });

  it('should reconstruct Operations from findByClientId', async () => {
    const prisma = mockPrisma({
      operationRecord: {
        findMany: jest.fn().mockResolvedValue([OPERATION_RECORD]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    });
    const repo = new PrismaOperationRepository(prisma);
    const ops = await repo.findByClientId('client-1');
    expect(ops).toHaveLength(1);
    expect(ops[0].valueClientId).toBe('client-1');
  });
});
