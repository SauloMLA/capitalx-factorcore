import { Operation } from './operation.entity';
import { Client } from './client.entity';
import { Invoice } from './invoice.entity';
import { TaxId } from '../common/value-objects/tax-id.value-object';
import { InvoiceFolio } from '../common/value-objects/invoice-folio.value-object';
import { Money } from '../common/value-objects/money.value-object';
import { DomainException } from '../common/exceptions/domain.exception';
import { OperationValidationException } from '../common/exceptions/operation-validation.exception';

// ─── Test helpers ─────────────────────────────────────────────────────────────

const REQUEST_DATE = new Date('2026-07-10T12:00:00Z');

function makeApprovedClient(): Client {
  const client = Client.create(
    'client-uuid-1',
    TaxId.create('XYZ850101XXX'),
    'Consorcio Industrial S.A.',
    'contact@consorcio.mx',
  );
  client.approve();
  return client;
}

function makePendingClient(): Client {
  return Client.create(
    'client-uuid-2',
    TaxId.create('ABC010101XYZ'),
    'Empresa Pendiente S.A.',
    'pending@empresa.mx',
  );
}

function makeValidInvoice(folio: string, daysAhead = 30): Invoice {
  const issueDate = new Date('2026-07-01T00:00:00Z');
  const dueDate = new Date(REQUEST_DATE);
  dueDate.setUTCDate(dueDate.getUTCDate() + daysAhead);

  return Invoice.create(
    `invoice-${folio}`,
    InvoiceFolio.create(folio),
    TaxId.create('DEF020202ABC'),
    'Deudor Comercial S.A.',
    Money.create(10000),
    issueDate,
    dueDate,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Operation Aggregate Root', () => {
  it('should create a valid operation and calculate amounts correctly', () => {
    const client = makeApprovedClient();
    const invoices = [makeValidInvoice('FOL-001'), makeValidInvoice('FOL-002')];

    const op = Operation.create('op-uuid-1', client, invoices, REQUEST_DATE, []);

    expect(op.valueId).toBe('op-uuid-1');
    expect(op.valueClientId).toBe('client-uuid-1');
    expect(op.valueTotalAmount.value).toBe(20000);
    expect(op.valueAdvancedAmount.value).toBe(17000);   // 20000 × 0.85
    expect(op.valueCommission.value).toBe(300);          // 20000 × 0.015
    expect(op.valueDepositAmount.value).toBe(16700);     // 17000 − 300
  });

  it('should throw DomainException if client is not APPROVED', () => {
    const client = makePendingClient();
    const invoices = [makeValidInvoice('FOL-001')];

    expect(() =>
      Operation.create('op-uuid-2', client, invoices, REQUEST_DATE, []),
    ).toThrow(DomainException);
  });

  it('should throw DomainException if no invoices are provided', () => {
    const client = makeApprovedClient();
    expect(() =>
      Operation.create('op-uuid-3', client, [], REQUEST_DATE, []),
    ).toThrow(DomainException);
  });

  it('should throw OperationValidationException when a folio was already financed', () => {
    const client = makeApprovedClient();
    const invoices = [makeValidInvoice('FOL-001')];

    let caught: OperationValidationException | undefined;
    try {
      Operation.create('op-uuid-4', client, invoices, REQUEST_DATE, ['FOL-001']);
    } catch (e) {
      caught = e as OperationValidationException;
    }

    expect(caught).toBeInstanceOf(OperationValidationException);
    expect(caught?.errors).toHaveLength(1);
    expect(caught?.errors[0].folio).toBe('FOL-001');
    expect(caught?.errors[0].reason).toContain('already been financed');
  });

  it('should throw OperationValidationException for duplicate folio within same operation', () => {
    const client = makeApprovedClient();
    const invoice1 = makeValidInvoice('FOL-DUP');
    const invoice2 = makeValidInvoice('FOL-DUP');

    let caught: OperationValidationException | undefined;
    try {
      Operation.create('op-uuid-5', client, [invoice1, invoice2], REQUEST_DATE, []);
    } catch (e) {
      caught = e as OperationValidationException;
    }

    expect(caught).toBeInstanceOf(OperationValidationException);
    const dupError = caught?.errors.find((e) => e.reason.includes('Duplicate folio'));
    expect(dupError).toBeDefined();
  });

  it('should throw OperationValidationException for invoice outside 15–120 day window', () => {
    const client = makeApprovedClient();
    // 5 days ahead — below 15-day minimum
    const tooSoon = makeValidInvoice('FOL-SHORT', 5);

    let caught: OperationValidationException | undefined;
    try {
      Operation.create('op-uuid-6', client, [tooSoon], REQUEST_DATE, []);
    } catch (e) {
      caught = e as OperationValidationException;
    }

    expect(caught).toBeInstanceOf(OperationValidationException);
    expect(caught?.errors[0].reason).toContain('15 and 120');
  });

  it('should collect all errors from multiple invalid invoices before rejecting', () => {
    const client = makeApprovedClient();
    const tooSoon = makeValidInvoice('FOL-A', 5);   // fails eligibility
    const alreadyDone = makeValidInvoice('FOL-B', 30);

    let caught: OperationValidationException | undefined;
    try {
      // FOL-B also pre-financed
      Operation.create('op-uuid-7', client, [tooSoon, alreadyDone], REQUEST_DATE, ['FOL-B']);
    } catch (e) {
      caught = e as OperationValidationException;
    }

    expect(caught).toBeInstanceOf(OperationValidationException);
    expect(caught?.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should throw OperationValidationException when debtor RFC is equal to client RFC (self-factoring)', () => {
    const client = makeApprovedClient(); // client RFC is XYZ850101XXX
    const issueDate = new Date('2026-07-01T00:00:00Z');
    const dueDate = new Date(REQUEST_DATE);
    dueDate.setUTCDate(dueDate.getUTCDate() + 30);

    const selfInvoice = Invoice.create(
      'inv-self',
      InvoiceFolio.create('FOL-SELF'),
      TaxId.create('XYZ850101XXX'), // Same as client!
      'Self Debtor',
      Money.create(10000),
      issueDate,
      dueDate,
    );

    let caught: OperationValidationException | undefined;
    try {
      Operation.create('op-uuid-self', client, [selfInvoice], REQUEST_DATE, []);
    } catch (e) {
      caught = e as OperationValidationException;
    }

    expect(caught).toBeInstanceOf(OperationValidationException);
    expect(caught?.errors[0].reason).toContain('Self-factoring');
  });
});
