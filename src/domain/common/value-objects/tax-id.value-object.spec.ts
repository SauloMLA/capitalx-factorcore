import { TaxId } from './tax-id.value-object';
import { DomainException } from '../exceptions/domain.exception';

describe('TaxId Value Object', () => {
  it('should create a valid 12-char moral person RFC', () => {
    const taxId = TaxId.create('XYZ850101XXX');
    expect(taxId.value).toBe('XYZ850101XXX');
  });

  it('should normalise to uppercase and strip hyphens', () => {
    const taxId = TaxId.create('xyz-850101-xxx');
    expect(taxId.value).toBe('XYZ850101XXX');
  });

  it('should throw DomainException for 13-char physical person RFC by default', () => {
    expect(() => TaxId.create('ABCD850101XXX')).toThrow(DomainException);
  });

  it('should allow 13-char physical person RFC when explicitly allowed in options', () => {
    const taxId = TaxId.create('ABCD850101XXX', { allowPhysicalPerson: true });
    expect(taxId.value).toBe('ABCD850101XXX');
  });

  it('should throw DomainException for invalid calendar month (e.g. month 99)', () => {
    expect(() => TaxId.create('XYZ859901XXX')).toThrow(DomainException);
  });

  it('should throw DomainException for invalid calendar day (e.g. Feb 30th)', () => {
    expect(() => TaxId.create('XYZ850230XXX')).toThrow(DomainException);
  });

  it('should throw DomainException for dates in the future (e.g. Dec 31st 2026)', () => {
    expect(() => TaxId.create('XYZ261231XXX')).toThrow(DomainException);
  });

  it('should throw DomainException if empty', () => {
    expect(() => TaxId.create('')).toThrow(DomainException);
  });

  it('should throw DomainException for invalid format', () => {
    expect(() => TaxId.create('INVALID')).toThrow(DomainException);
  });
});
