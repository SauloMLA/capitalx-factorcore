import { Percentage } from './percentage.value-object';
import { DomainException } from '../exceptions/domain.exception';

describe('Percentage Value Object', () => {
  it('should create valid percentage', () => {
    const pct = Percentage.create(45.5);
    expect(pct.value).toBe(45.5);
    expect(pct.toFraction()).toBe(0.455);
  });

  it('should throw DomainException if value is less than 0 or greater than 100', () => {
    expect(() => Percentage.create(-0.1)).toThrow(DomainException);
    expect(() => Percentage.create(100.01)).toThrow(DomainException);
  });

  it('should verify equality', () => {
    const p1 = Percentage.create(10);
    const p2 = Percentage.create(10);
    const p3 = Percentage.create(20);
    expect(p1.equals(p2)).toBe(true);
    expect(p1.equals(p3)).toBe(false);
  });
});
