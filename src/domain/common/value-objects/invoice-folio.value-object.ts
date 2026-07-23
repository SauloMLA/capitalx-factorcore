import { DomainException } from '../exceptions/domain.exception';

/**
 * VALUE OBJECT: Folio de Factura (InvoiceFolio)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Encapsular y dar formato uniforme al folio o número identificador de una factura.
 * Asegura que no existan folios vacíos y estandariza su almacenamiento a mayúsculas sin espacios.
 */
export class InvoiceFolio {
  private readonly folioValue: string;

  // Constructor privado: previene el uso de "new InvoiceFolio()" fuera de la clase
  private constructor(value: string) {
    this.folioValue = value.trim();
  }

  // Fábrica estática para aplicar las validaciones de negocio en el nacimiento del folio
  public static create(value: string): InvoiceFolio {
    if (!value || value.trim().length === 0) {
      throw new DomainException('Invoice folio cannot be empty');
    }
    // Estandariza a mayúsculas y remueve espacios en los bordes
    const cleanValue = value.trim().toUpperCase();
    return new InvoiceFolio(cleanValue);
  }

  public get value(): string {
    return this.folioValue;
  }

  // Compara dos objetos de valor por sus propiedades internas, no por su dirección en memoria
  public equals(other: InvoiceFolio): boolean {
    return this.folioValue === other.folioValue;
  }
}
