import { Invoice } from './invoice.entity';
import { InvoiceFolio } from '../common/value-objects/invoice-folio.value-object';
import { TaxId } from '../common/value-objects/tax-id.value-object';
import { Money } from '../common/value-objects/money.value-object';
import { DomainException } from '../common/exceptions/domain.exception';

describe('Invoice Entity', () => {
  const mockId = 'uuid-invoice-1';
  const mockFolio = InvoiceFolio.create('FOL-001');
  const mockDebtorTaxId = TaxId.create('ABC010101XYZ');
  const mockDebtorName = 'Tiendas Comercializadoras S.A.';
  const mockAmount = Money.create(50000.00);
  const mockIssueDate = new Date('2026-07-10T10:00:00Z');
  const mockDueDate = new Date('2026-07-30T10:00:00Z');

  it('should create a valid invoice entity', () => {
    const invoice = Invoice.create(
      mockId,
      mockFolio,
      mockDebtorTaxId,
      mockDebtorName,
      mockAmount,
      mockIssueDate,
      mockDueDate
    );

    expect(invoice.valueId).toBe(mockId);
    expect(invoice.valueFolio.value).toBe('FOL-001');
    expect(invoice.valueDebtorTaxId.value).toBe('ABC010101XYZ');
    expect(invoice.valueDebtorName).toBe(mockDebtorName);
    expect(invoice.valueAmount.value).toBe(50000.00);
    expect(invoice.valueIssueDate).toBe(mockIssueDate);
    expect(invoice.valueDueDate).toBe(mockDueDate);
  });

  it('should throw DomainException if ID is empty', () => {
    expect(() =>
      Invoice.create('', mockFolio, mockDebtorTaxId, mockDebtorName, mockAmount, mockIssueDate, mockDueDate)
    ).toThrow(DomainException);
  });

  it('should throw DomainException if debtor name is empty', () => {
    expect(() =>
      Invoice.create(mockId, mockFolio, mockDebtorTaxId, '  ', mockAmount, mockIssueDate, mockDueDate)
    ).toThrow(DomainException);
  });

  it('should throw DomainException if due date is equal to or before issue date', () => {
    const invalidDueDate = new Date('2026-07-10T09:00:00Z');
    expect(() =>
      Invoice.create(mockId, mockFolio, mockDebtorTaxId, mockDebtorName, mockAmount, mockIssueDate, invalidDueDate)
    ).toThrow(DomainException);
  });

  it('should calculate remaining days correctly from a reference date', () => {
    const invoice = Invoice.create(
      mockId,
      mockFolio,
      mockDebtorTaxId,
      mockDebtorName,
      mockAmount,
      mockIssueDate,
      mockDueDate // 2026-07-30
    );

    const referenceDate = new Date('2026-07-15T00:00:00Z');
    expect(invoice.getRemainingDays(referenceDate)).toBe(15);
  });

  it('should evaluate eligibility correctly based on remaining days', () => {
    const invoice = Invoice.create(
      mockId,
      mockFolio,
      mockDebtorTaxId,
      mockDebtorName,
      mockAmount,
      mockIssueDate,
      mockDueDate // 2026-07-30
    );

    // 15 days remaining -> Eligible
    const eligibleRef = new Date('2026-07-15T12:00:00Z');
    expect(invoice.isEligibleForFinancing(eligibleRef)).toBe(true);

    // 14 days remaining -> Ineligible
    const ineligibleRef = new Date('2026-07-16T12:00:00Z');
    expect(invoice.isEligibleForFinancing(ineligibleRef)).toBe(false);
  });
});
