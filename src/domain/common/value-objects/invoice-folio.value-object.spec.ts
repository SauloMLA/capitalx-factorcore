import { InvoiceFolio } from './invoice-folio.value-object';
import { DomainException } from '../exceptions/domain.exception';

describe('InvoiceFolio Value Object', () => {
  it('should create valid folio and clean spaces/casing', () => {
    const folio = InvoiceFolio.create('  f-12345a  ');
    expect(folio.value).toBe('F-12345A');
  });

  it('should throw DomainException if empty', () => {
    expect(() => InvoiceFolio.create('')).toThrow(DomainException);
    expect(() => InvoiceFolio.create('   ')).toThrow(DomainException);
  });
});
