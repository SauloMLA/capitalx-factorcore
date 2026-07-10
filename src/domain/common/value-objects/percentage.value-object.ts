import { DomainException } from '../exceptions/domain.exception';

export class Percentage {
  private readonly pctValue: number;

  private constructor(value: number) {
    this.pctValue = value;
  }

  public static create(value: number): Percentage {
    if (value < 0 || value > 100) {
      throw new DomainException('Percentage value must be between 0 and 100');
    }
    return new Percentage(value);
  }

  public get value(): number {
    return this.pctValue;
  }

  public toFraction(): number {
    return this.pctValue / 100;
  }

  public equals(other: Percentage): boolean {
    return this.pctValue === other.pctValue;
  }
}
