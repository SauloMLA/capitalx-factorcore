import { DomainException } from '../exceptions/domain.exception';

export class TaxId {
  private readonly idValue: string;

  private constructor(value: string) {
    this.idValue = value;
  }

  public static create(value: string): TaxId {
    if (!value) {
      throw new DomainException('Tax ID cannot be empty');
    }
    // Normalise: strip hyphens/spaces, uppercase
    const normalised = value.replace(/[-\s]/g, '').toUpperCase();

    // Strictly Mexican RFC for moral persons: 3 letters + 6 digits + 3 alphanumeric = 12 chars
    const rfcMoralRegex = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/;
    if (!rfcMoralRegex.test(normalised)) {
      throw new DomainException(
        'Invalid RFC. Must be a valid 12-character Mexican moral person RFC',
      );
    }

    return new TaxId(normalised);
  }

  public get value(): string {
    return this.idValue;
  }

  public equals(other: TaxId): boolean {
    return this.idValue === other.idValue;
  }
}
