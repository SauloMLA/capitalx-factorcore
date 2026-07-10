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

  it('should throw DomainException for 13-char physical person RFC', () => {
    // Physical person RFC has 4 letters — not allowed in this domain
    expect(() => TaxId.create('ABCD850101XXX')).toThrow(DomainException);
  });

  it('should throw DomainException if empty', () => {
    expect(() => TaxId.create('')).toThrow(DomainException);
  });

  it('should throw DomainException for invalid format', () => {
    expect(() => TaxId.create('INVALID')).toThrow(DomainException);
  });
});
