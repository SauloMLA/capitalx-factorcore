import { TaxId } from './tax-id.value-object';
import { DomainException } from '../exceptions/domain.exception';

describe('TaxId Value Object', () => {
  it('should create valid RFC tax ID (moral person 12 chars)', () => {
    const taxId = TaxId.create('XYZ850101XXX');
    expect(taxId.value).toBe('XYZ850101XXX');
  });

  it('should create valid RFC tax ID (physical person 13 chars)', () => {
    const taxId = TaxId.create('ABCD850101XXX');
    expect(taxId.value).toBe('ABCD850101XXX');
  });

  it('should strip hyphens and spaces during creation', () => {
    const taxId = TaxId.create('XYZ - 850101 - XXX');
    expect(taxId.value).toBe('XYZ850101XXX');
  });

  it('should throw DomainException if empty or invalid RFC pattern', () => {
    expect(() => TaxId.create('')).toThrow(DomainException);
    expect(() => TaxId.create('INVALID')).toThrow(DomainException);
  });
});
