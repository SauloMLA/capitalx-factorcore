import { DomainException } from '../exceptions/domain.exception';

export interface TaxIdOptions {
  allowPhysicalPerson?: boolean;
}

/**
 * VALUE OBJECT: RFC de Persona Moral o Física (TaxId)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Encapsular y validar que un RFC corresponda a una Persona Moral (12 chars)
 * o Persona Física (13 chars si está permitido en el contexto).
 * Aplica reglas de limpieza, validación mediante expresiones regulares,
 * integridad de fecha calendario (AAMMDD), no futuridad y límite de 100 años de antigüedad.
 */
export class TaxId {
  private readonly idValue: string;

  private constructor(value: string) {
    this.idValue = value;
  }

  public static create(value: string, options: TaxIdOptions = {}): TaxId {
    if (!value) {
      throw new DomainException('Tax ID cannot be empty');
    }
    const normalised = value.replace(/[-\s]/g, '').toUpperCase();

    const isMoral = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/.test(normalised);
    const isFisica = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/.test(normalised);

    if (!isMoral && (!options.allowPhysicalPerson || !isFisica)) {
      throw new DomainException(
        options.allowPhysicalPerson
          ? 'Invalid RFC. Must be a valid 12-character (moral) or 13-character (physical) Mexican RFC'
          : 'Invalid RFC. Must be a valid 12-character Mexican moral person RFC',
      );
    }

    // Extraer la subcadena AAMMDD
    const datePart = isMoral ? normalised.substring(3, 9) : normalised.substring(4, 10);
    TaxId.validateRfcDate(datePart);

    return new TaxId(normalised);
  }

  private static validateRfcDate(datePart: string): void {
    const yy = parseInt(datePart.substring(0, 2), 10);
    const mm = parseInt(datePart.substring(2, 4), 10);
    const dd = parseInt(datePart.substring(4, 6), 10);

    if (mm < 1 || mm > 12) {
      throw new DomainException('Invalid RFC. Month component (MM) must be between 01 and 12');
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentCenturyYY = currentYear % 100;

    let year = yy <= currentCenturyYY ? 2000 + yy : 1900 + yy;

    const parsedDate = new Date(Date.UTC(year, mm - 1, dd));

    // Validar integridad de la fecha en el calendario
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== mm - 1 ||
      parsedDate.getUTCDate() !== dd
    ) {
      throw new DomainException('Invalid RFC. Date component (AAMMDD) is not a valid calendar date');
    }

    // Validar que no sea una fecha en el futuro
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (parsedDate.getTime() > todayUTC) {
      throw new DomainException('Invalid RFC. Date component cannot be in the future');
    }

    // Validar que la persona/empresa no tenga más de 100 años de antigüedad
    const ageInYears = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageInYears > 100) {
      throw new DomainException('Invalid RFC. Birth or incorporation date cannot be older than 100 years');
    }
  }

  public get value(): string {
    return this.idValue;
  }

  public equals(other: TaxId): boolean {
    return this.idValue === other.idValue;
  }
}
