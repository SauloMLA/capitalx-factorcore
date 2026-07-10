import { DomainException } from './domain.exception';

export interface InvoiceValidationError {
  folio: string;
  reason: string;
}

export class OperationValidationException extends DomainException {
  public readonly errors: InvoiceValidationError[];

  constructor(errors: InvoiceValidationError[]) {
    super('Operation validation failed');
    this.errors = errors;
  }
}
