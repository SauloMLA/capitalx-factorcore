import { DomainException } from '../exceptions/domain.exception';

/**
 * VALUE OBJECT: RFC de Persona Moral (TaxId)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Encapsular y validar que un RFC corresponda exactamente a una Persona Moral en México.
 * Aplica reglas estrictas de limpieza de caracteres y validación mediante expresiones regulares.
 */
export class TaxId {
  private readonly idValue: string;

  private constructor(value: string) {
    this.idValue = value;
  }

  // Fábrica estática para validar y limpiar el RFC al crearse
  public static create(value: string): TaxId {
    if (!value) {
      throw new DomainException('Tax ID cannot be empty');
    }
    // Remueve guiones y espacios en blanco, y lo convierte todo a mayúsculas
    const normalised = value.replace(/[-\s]/g, '').toUpperCase();

    /**
     * Expresión Regular para RFC de Persona Moral Mexicana:
     * - ^[A-ZÑ&]{3} : Inicia con 3 letras de la razón social (incluye la Ñ y el & comercial)
     * - [0-9]{6}    : Siguen 6 dígitos numéricos (AAMMDD - fecha de constitución)
     * - [A-Z0-9]{3}$ : Finaliza con 3 caracteres alfanuméricos de la homoclave
     */
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
