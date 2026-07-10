import { InvoiceFolio } from '../common/value-objects/invoice-folio.value-object';
import { TaxId } from '../common/value-objects/tax-id.value-object';
import { Money } from '../common/value-objects/money.value-object';
import { DomainException } from '../common/exceptions/domain.exception';

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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isEligibleForFinancing(requestDate: Date): boolean {
    return this.getRemainingDays(requestDate) >= 15;
  }
}
