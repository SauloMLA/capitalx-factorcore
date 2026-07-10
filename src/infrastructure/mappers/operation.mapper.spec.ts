import { OperationMapper, OperationRecordWithInvoices } from './operation.mapper';
import { Money } from '../../domain/common/value-objects/money.value-object';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ISSUE_DATE = new Date('2026-07-01T00:00:00Z');
const DUE_DATE   = new Date('2026-08-10T00:00:00Z'); // 40 days ahead

function makeRecord(): OperationRecordWithInvoices {
  return {
    id: 'op-1',
    clientId: 'client-1',
    totalAmount: 10000,
    advancedAmount: 8500,
    commission: 150,
    depositAmount: 8350,
    createdAt: new Date('2026-07-10T00:00:00Z'),
    invoices: [
      {
        id: 'inv-1',
        operationId: 'op-1',
        folio: 'FOL-001',
        debtorRfc: 'DEF020202ABC',
        debtorName: 'Deudor S.A.',
        amount: 10000,
        issueDate: ISSUE_DATE,
        dueDate: DUE_DATE,
        createdAt: new Date('2026-07-10T00:00:00Z'),
      },
    ],
  };
}

// ─── toDomain ────────────────────────────────────────────────────────────────

describe('OperationMapper.toDomain', () => {
  it('should reconstruct an Operation with correct scalar values', () => {
    const op = OperationMapper.toDomain(makeRecord());
    expect(op.valueId).toBe('op-1');
    expect(op.valueClientId).toBe('client-1');
    expect(op.valueTotalAmount.value).toBe(10000);
    expect(op.valueAdvancedAmount.value).toBe(8500);
    expect(op.valueCommission.value).toBe(150);
    expect(op.valueDepositAmount.value).toBe(8350);
  });

  it('should reconstruct nested invoices correctly', () => {
    const op = OperationMapper.toDomain(makeRecord());
    expect(op.valueInvoices).toHaveLength(1);
    expect(op.valueInvoices[0].valueFolio.value).toBe('FOL-001');
    expect(op.valueInvoices[0].valueDebtorName).toBe('Deudor S.A.');
    expect(op.valueInvoices[0].valueAmount.value).toBe(10000);
  });

  it('should restore dates without time-zone drift', () => {
    const op = OperationMapper.toDomain(makeRecord());
    const inv = op.valueInvoices[0];
    expect(inv.valueIssueDate.toISOString()).toBe(ISSUE_DATE.toISOString());
    expect(inv.valueDueDate.toISOString()).toBe(DUE_DATE.toISOString());
  });
});

// ─── toPersistence ───────────────────────────────────────────────────────────

describe('OperationMapper.toPersistence', () => {
  it('should produce correct operation record fields', () => {
    const op = OperationMapper.toDomain(makeRecord());
    const { operationRecord } = OperationMapper.toPersistence(op);
    expect(operationRecord.id).toBe('op-1');
    expect(operationRecord.clientId).toBe('client-1');
    expect(operationRecord.totalAmount).toBe(10000);
    expect(operationRecord.advancedAmount).toBe(8500);
    expect(operationRecord.commission).toBe(150);
    expect(operationRecord.depositAmount).toBe(8350);
  });

  it('should produce one invoice record per invoice', () => {
    const op = OperationMapper.toDomain(makeRecord());
    const { invoiceRecords } = OperationMapper.toPersistence(op);
    expect(invoiceRecords).toHaveLength(1);
    expect(invoiceRecords[0].folio).toBe('FOL-001');
    expect(invoiceRecords[0].operationId).toBe('op-1');
    expect(invoiceRecords[0].debtorRfc).toBe('DEF020202ABC');
    expect(invoiceRecords[0].amount).toBe(10000);
  });

  it('should produce a round-trip with consistent amounts', () => {
    const original = makeRecord();
    const op = OperationMapper.toDomain(original);
    const { operationRecord } = OperationMapper.toPersistence(op);
    expect(operationRecord.totalAmount).toBe(original.totalAmount);
    expect(operationRecord.advancedAmount).toBe(original.advancedAmount);
    expect(operationRecord.commission).toBe(original.commission);
    expect(operationRecord.depositAmount).toBe(original.depositAmount);
  });
});
