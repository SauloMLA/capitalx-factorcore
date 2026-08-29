import { InvoiceFolio } from '../common/value-objects/invoice-folio.value-object';
import { TaxId } from '../common/value-objects/tax-id.value-object';
import { Money } from '../common/value-objects/money.value-object';
import { DomainException } from '../common/exceptions/domain.exception';

/**
 * ENTIDAD: Factura (Invoice)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Representar un documento por cobrar que es cedido por el cliente.
 * Almacena los folios, montos, plazos de vigencia y datos del deudor de forma estructurada.
 * Realiza cálculos temporales exactos para decidir si la factura es elegible.
 */
export class Invoice {
  private readonly id: string;
  private readonly folio: InvoiceFolio;
  private readonly debtorTaxId: TaxId;
  private readonly debtorName: string;
  private readonly amount: Money;
  private readonly issueDate: Date;
  private readonly dueDate: Date;

  private constructor(
    id: string,
    folio: InvoiceFolio,
    debtorTaxId: TaxId,
    debtorName: string,
    amount: Money,
    issueDate: Date,
    dueDate: Date
  ) {
    this.id = id;
    this.folio = folio;
    this.debtorTaxId = debtorTaxId;
    this.debtorName = debtorName;
    this.amount = amount;
    this.issueDate = issueDate;
    this.dueDate = dueDate;
  }

  // Fábrica estática: valida la coherencia básica del nacimiento de una factura
  public static create(
    id: string,
    folio: InvoiceFolio,
    debtorTaxId: TaxId,
    debtorName: string,
    amount: Money,
    issueDate: Date,
    dueDate: Date
  ): Invoice {
    if (!id || id.trim().length === 0) {
      throw new DomainException('Invoice ID cannot be empty');
    }
    if (!debtorName || debtorName.trim().length === 0) {
      throw new DomainException('Debtor name cannot be empty');
    }
    if (dueDate.getTime() <= issueDate.getTime()) {
      throw new DomainException('Due date must be after issue date');
    }
    return new Invoice(id, folio, debtorTaxId, debtorName.trim(), amount, issueDate, dueDate);
  }

  /**
   * Reconstitución: restaura una factura desde la base de datos sin ejecutar validaciones de negocio.
   * Utilizado únicamente por el Mapper de la Operación.
   */
  public static reconstitute(
    id: string,
    folio: InvoiceFolio,
    debtorTaxId: TaxId,
    debtorName: string,
    amount: Money,
    issueDate: Date,
    dueDate: Date,
  ): Invoice {
    return new Invoice(id, folio, debtorTaxId, debtorName, amount, issueDate, dueDate);
  }

  // Getters para exponer atributos de manera inmutable
  public get valueId(): string {
    return this.id;
  }

  public get valueFolio(): InvoiceFolio {
    return this.folio;
  }

  public get valueDebtorTaxId(): TaxId {
    return this.debtorTaxId;
  }

  public get valueDebtorName(): string {
    return this.debtorName;
  }

  public get valueAmount(): Money {
    return this.amount;
  }

  public get valueIssueDate(): Date {
    return this.issueDate;
  }

  public get valueDueDate(): Date {
    return this.dueDate;
  }

  // Calcula exactamente los días calendario restantes usando huso horario UTC neutral
  public getRemainingDays(referenceDate: Date): number {
    const refMidnight = Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    );
    const dueMidnight = Date.UTC(
      this.dueDate.getUTCFullYear(),
      this.dueDate.getUTCMonth(),
      this.dueDate.getUTCDate()
    );
    
    const diffTime = dueMidnight - refMidnight;
    // Convierte milisegundos a días calendario usando redondeo hacia arriba (Math.ceil)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Comprueba la regla de negocio RD-INV-003 (plazo de vencimiento entre 15 y 120 días)
  public isEligibleForFinancing(requestDate: Date): boolean {
    const days = this.getRemainingDays(requestDate);
    return days >= 15 && days <= 120;
  }
}
