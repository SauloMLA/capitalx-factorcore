import { Money } from './money.value-object';
import { DomainException } from '../exceptions/domain.exception';

describe('Money Value Object', () => {
  it('should create valid money object and round to 2 decimals', () => {
    const money = Money.create(100.456);
    expect(money.value).toBe(100.46);
  });

  it('should throw DomainException if amount is negative', () => {
    expect(() => Money.create(-1)).toThrow(DomainException);
  });

  it('should perform addition correctly', () => {
    const m1 = Money.create(10.50);
    const m2 = Money.create(20.25);
    const sum = m1.add(m2);
    expect(sum.value).toBe(30.75);
  });

  it('should perform subtraction correctly', () => {
    const m1 = Money.create(50.00);
    const m2 = Money.create(20.50);
    const diff = m1.subtract(m2);
    expect(diff.value).toBe(29.50);
  });

  it('should throw DomainException if subtraction results in negative amount', () => {
    const m1 = Money.create(10.00);
    const m2 = Money.create(20.00);
    expect(() => m1.subtract(m2)).toThrow(DomainException);
  });

  it('should multiply by factor correctly', () => {
    const money = Money.create(10.00);
    const result = money.multiply(1.5);
    expect(result.value).toBe(15.00);
  });
});
