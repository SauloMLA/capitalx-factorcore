import { DomainException } from '../exceptions/domain.exception';

export class TaxId {
  private readonly idValue: string;

  private constructor(value: string) {
    this.idValue = value.toUpperCase();
  }

  public static create(value: string): TaxId {
    if (!value) {
      throw new DomainException('Tax ID cannot be empty');
    }
    const cleanValue = value.replace(/[-\s]/g, ''); // strip hyphens or spaces
    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/i;
    
    if (!rfcRegex.test(cleanValue)) {
      throw new DomainException('Invalid Tax ID (RFC) format');
    }

    return new TaxId(cleanValue);
  }

  public get value(): string {
    return this.idValue;
  }

  public equals(other: TaxId): boolean {
    return this.idValue === other.idValue;
  }
}
