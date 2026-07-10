import { DomainException } from '../exceptions/domain.exception';

export class InvoiceFolio {
  private readonly folioValue: string;

  private constructor(value: string) {
    this.folioValue = value.trim();
  }

  public static create(value: string): InvoiceFolio {
    if (!value || value.trim().length === 0) {
      throw new DomainException('Invoice folio cannot be empty');
    }
    // Clean spaces and keep uppercase
    const cleanValue = value.trim().toUpperCase();
    return new InvoiceFolio(cleanValue);
  }

  public get value(): string {
    return this.folioValue;
  }

  public equals(other: InvoiceFolio): boolean {
    return this.folioValue === other.folioValue;
  }
}
