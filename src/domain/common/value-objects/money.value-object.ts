import { DomainException } from '../exceptions/domain.exception';

export class Money {
  private readonly amount: number;

  private constructor(amount: number) {
    this.amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
  }

  public static create(amount: number): Money {
    if (amount < 0) {
      throw new DomainException('Money amount cannot be negative');
    }
    return new Money(amount);
  }

  public get value(): number {
    return this.amount;
  }

  public add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  public subtract(other: Money): Money {
    const diff = this.amount - other.amount;
    if (diff < 0) {
      throw new DomainException('Resulting money amount cannot be negative');
    }
    return new Money(diff);
  }

  public multiply(factor: number): Money {
    if (factor < 0) {
      throw new DomainException('Multiplication factor cannot be negative');
    }
    return new Money(this.amount * factor);
  }

  public isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}
