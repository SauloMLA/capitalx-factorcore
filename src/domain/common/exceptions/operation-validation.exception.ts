import { DomainException } from './domain.exception';

/**
 * Interface para detallar errores específicos por folio de factura.
 */
export interface InvoiceValidationError {
  folio: string; // Folio de la factura que causó el error
  reason: string; // Razón exacta por la cual fue rechazada
}

/**
 * EXCEPCIÓN DE VALIDACIÓN DE OPERACIÓN
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Es una excepción contenedora de errores. Se lanza cuando intentamos registrar un lote de facturas
 * y una o más de ellas violan reglas de negocio. En lugar de fallar en la primera factura y ocultar
 * los errores de las demás, este error colecta y expone la lista de todas las facturas inválidas.
 */
export class OperationValidationException extends DomainException {
  // Contiene la lista detallada de errores por factura
  public readonly errors: InvoiceValidationError[];

  constructor(errors: InvoiceValidationError[]) {
    super('Operation validation failed');
    this.errors = errors;
  }
}
