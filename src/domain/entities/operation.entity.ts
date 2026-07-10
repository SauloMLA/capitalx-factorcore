import { Money } from '../common/value-objects/money.value-object';
import { Client } from './client.entity';
import { Invoice } from './invoice.entity';
import { DomainException } from '../common/exceptions/domain.exception';
import {
  InvoiceValidationError,
  OperationValidationException,
} from '../common/exceptions/operation-validation.exception';

export class Operation {
  private readonly id: string;
  private readonly clientId: string;
  private readonly invoices: Invoice[];
  private readonly totalAmount: Money;
  private readonly advancedAmount: Money;
  private readonly commission: Money;
  private readonly depositAmount: Money;

  private constructor(
    id: string,
    clientId: string,
    invoices: Invoice[],
    totalAmount: Money,
    advancedAmount: Money,
    commission: Money,
    depositAmount: Money,
  ) {
    this.id = id;
    this.clientId = clientId;
    this.invoices = invoices;
    this.totalAmount = totalAmount;
    this.advancedAmount = advancedAmount;
    this.commission = commission;
    this.depositAmount = depositAmount;
  }

  /**
   * Creates and validates a new Operation.
   *
   * The Application Layer is responsible for:
   *   - finding the client (throws if not found)
   *   - providing existing financed folios for this client
   *
   * Operation is responsible for:
   *   - verifying the client is APPROVED
   *   - validating every invoice against business rules
   *   - preventing duplicate financing via existingFolios
   *   - rejecting the whole operation if any invoice fails
   *   - calculating all monetary amounts
   */
  public static create(
    id: string,
    client: Client,
    invoices: Invoice[],
    requestDate: Date,
    existingFolios: string[],
  ): Operation {
    if (!id || id.trim().length === 0) {
      throw new DomainException('Operation ID cannot be empty');
    }
    if (invoices.length === 0) {
      throw new DomainException('Operation must contain at least one invoice');
    }

    Operation.validateClientIsApproved(client);
    Operation.validateInvoices(invoices, requestDate, existingFolios);

    const amounts = Operation.calculateAmounts(invoices);

    return new Operation(
      id,
      client.valueId,
      invoices,
      amounts.totalAmount,
      amounts.advancedAmount,
      amounts.commission,
      amounts.depositAmount,
    );
  }

  // ─── Business Rule: Client must be APPROVED ────────────────────────────────

  private static validateClientIsApproved(client: Client): void {
    if (!client.isApproved()) {
      throw new DomainException('Client must be approved before creating an operation');
    }
  }

  // ─── Business Rule: All invoices must pass; collect all errors ────────────

  private static validateInvoices(
    invoices: Invoice[],
    requestDate: Date,
    existingFolios: string[],
  ): void {
    const errors: InvoiceValidationError[] = [];
    const seenFolios = new Set<string>();

    for (const invoice of invoices) {
      const folio = invoice.valueFolio.value;

      // Rule: amount > 0
      if (invoice.valueAmount.value <= 0) {
        errors.push({ folio, reason: 'Amount must be greater than zero' });
      }

      // Rule: issue date must not be in the future
      const issueMidnight = Date.UTC(
        invoice.valueIssueDate.getUTCFullYear(),
        invoice.valueIssueDate.getUTCMonth(),
        invoice.valueIssueDate.getUTCDate(),
      );
      const requestMidnight = Date.UTC(
        requestDate.getUTCFullYear(),
        requestDate.getUTCMonth(),
        requestDate.getUTCDate(),
      );
      if (issueMidnight > requestMidnight) {
        errors.push({ folio, reason: 'Issue date cannot be in the future' });
      }

      // Rule: due date must be after today
      const dueMidnight = Date.UTC(
        invoice.valueDueDate.getUTCFullYear(),
        invoice.valueDueDate.getUTCMonth(),
        invoice.valueDueDate.getUTCDate(),
      );
      if (dueMidnight <= requestMidnight) {
        errors.push({ folio, reason: 'Due date must be a future date' });
      }

      // Rule: remaining term between 15 and 120 days
      if (!invoice.isEligibleForFinancing(requestDate)) {
        errors.push({
          folio,
          reason: 'Remaining term must be between 15 and 120 calendar days',
        });
      }

      // Rule: no duplicate folios within this operation
      if (seenFolios.has(folio)) {
        errors.push({ folio, reason: 'Duplicate folio within the same operation' });
      }
      seenFolios.add(folio);

      // Rule: folio not already financed for this client in a previous operation
      if (existingFolios.includes(folio)) {
        errors.push({ folio, reason: 'Invoice folio has already been financed' });
      }
    }

    if (errors.length > 0) {
      throw new OperationValidationException(errors);
    }
  }

  // ─── Business Rule: Fixed-rate calculations ───────────────────────────────

  private static calculateAmounts(invoices: Invoice[]): {
    totalAmount: Money;
    advancedAmount: Money;
    commission: Money;
    depositAmount: Money;
  } {
    const total = invoices.reduce(
      (sum, inv) => sum.add(inv.valueAmount),
      Money.create(0),
    );

    const advanced = total.multiply(0.85);     // monto_adelantado = total × 0.85
    const commission = total.multiply(0.015);  // comisión         = total × 0.015
    const deposit = advanced.subtract(commission); // monto_a_depositar = adelantado − comisión

    return { totalAmount: total, advancedAmount: advanced, commission, depositAmount: deposit };
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  public get valueId(): string {
    return this.id;
  }

  public get valueClientId(): string {
    return this.clientId;
  }

  public get valueInvoices(): Invoice[] {
    return this.invoices;
  }

  public get valueTotalAmount(): Money {
    return this.totalAmount;
  }

  public get valueAdvancedAmount(): Money {
    return this.advancedAmount;
  }

  public get valueCommission(): Money {
    return this.commission;
  }

  public get valueDepositAmount(): Money {
    return this.depositAmount;
  }
}
