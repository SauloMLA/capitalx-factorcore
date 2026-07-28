import { Money } from '../common/value-objects/money.value-object';
import { Client } from './client.entity';
import { Invoice } from './invoice.entity';
import { DomainException } from '../common/exceptions/domain.exception';
import {
  InvoiceValidationError,
  OperationValidationException,
} from '../common/exceptions/operation-validation.exception';

/**
 * AGREGADO / ENTIDAD RAÍZ: Operación (Operation)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Es el bloque principal y frontera transaccional de nuestro sistema financiero.
 * Agrupa un lote de facturas de un cliente y evalúa si todo el lote cumple con las reglas del negocio.
 * Si una sola factura no pasa las validaciones, rechaza toda la operación.
 * Realiza los cálculos consolidados de aforo (85%), comisión (1.5%) y depósito neto.
 * 
 * Defensa en entrevista:
 * "La Operación actúa como un Aggregate Root. Garantiza la consistencia del lote de facturas,
 * evitando que existan facturas duplicadas en el lote o folios que ya hayan sido financiados 
 * en el pasado (evita doble financiamiento). Todas las matemáticas de cobro ocurren aquí adentro
 * de manera inmutable."
 */
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

  // Fábrica estática: el único punto para crear y validar una nueva operación
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

    // 1. Validar que el cliente asociado esté aprobado (RD-OP-001)
    Operation.validateClientIsApproved(client);

    // 2. Validar detalladamente cada factura del lote
    Operation.validateInvoices(invoices, requestDate, existingFolios, client);

    // 3. Si las validaciones pasan, calcular las sumas, comisiones y depósito
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

  /**
   * Reconstitución: restaura una operación histórica desde la base de datos sin ejecutar validaciones de negocio.
   * Utilizado únicamente por el Mapper de Infraestructura.
   */
  public static reconstitute(
    id: string,
    clientId: string,
    invoices: Invoice[],
    totalAmount: Money,
    advancedAmount: Money,
    commission: Money,
    depositAmount: Money,
  ): Operation {
    return new Operation(id, clientId, invoices, totalAmount, advancedAmount, commission, depositAmount);
  }

  // Regla RD-OP-001: El cliente debe estar APPROVED para operar
  private static validateClientIsApproved(client: Client): void {
    if (!client.isApproved()) {
      throw new DomainException('Client must be approved before creating an operation');
    }
  }

  // Valida el lote de facturas acumulando todos los errores encontrados
  private static validateInvoices(
    invoices: Invoice[],
    requestDate: Date,
    existingFolios: string[],
    client: Client,
  ): void {
    const errors: InvoiceValidationError[] = [];
    const seenFolios = new Set<string>();

    for (const invoice of invoices) {
      const folio = invoice.valueFolio.value;

      // Regla Anti Auto-Factoraje: El deudor no puede ser el mismo cliente cedente
      if (invoice.valueDebtorTaxId.equals(client.valueTaxId)) {
        errors.push({
          folio,
          reason: 'Self-factoring is not allowed: debtor RFC cannot match client RFC',
        });
      }

      // Regla RD-INV-001: El monto de cada factura debe ser estrictamente positivo
      if (invoice.valueAmount.value <= 0) {
        errors.push({ folio, reason: 'Amount must be greater than zero' });
      }

      // Regla RD-INV-002: La fecha de emisión no puede ser futura respecto al día de hoy (requestDate)
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

      // Regla RD-INV-002: La fecha de vencimiento debe ser posterior a la fecha de hoy
      const dueMidnight = Date.UTC(
        invoice.valueDueDate.getUTCFullYear(),
        invoice.valueDueDate.getUTCMonth(),
        invoice.valueDueDate.getUTCDate(),
      );
      if (dueMidnight <= requestMidnight) {
        errors.push({ folio, reason: 'Due date must be a future date' });
      }

      // Regla RD-INV-003: El plazo de vigencia debe encontrarse estrictamente entre 15 y 120 días calendario
      if (!invoice.isEligibleForFinancing(requestDate)) {
        errors.push({
          folio,
          reason: 'Remaining term must be between 15 and 120 calendar days',
        });
      }

      // Regla RD-OP-002: Previene duplicación de folios de factura dentro de este mismo lote/operación
      if (seenFolios.has(folio)) {
        errors.push({ folio, reason: 'Duplicate folio within the same operation' });
      }
      seenFolios.add(folio);

      // Regla RD-OP-002: Previene duplicación contra folios de facturas ya financiados previamente por el cliente
      if (existingFolios.includes(folio)) {
        errors.push({ folio, reason: 'Invoice folio has already been financed' });
      }
    }

    // Si encontramos algún error en las facturas, lanzamos la excepción colectora
    if (errors.length > 0) {
      throw new OperationValidationException(errors);
    }
  }

  // Regla RD-OP-003: Fórmulas matemáticas de factoraje
  private static calculateAmounts(invoices: Invoice[]): {
    totalAmount: Money;
    advancedAmount: Money;
    commission: Money;
    depositAmount: Money;
  } {
    // 1. Sumar los montos de todas las facturas
    const total = invoices.reduce(
      (sum, inv) => sum.add(inv.valueAmount),
      Money.create(0),
    );

    // 2. Monto Adelantado = Total × 85% (Aforo)
    const advanced = total.multiply(0.85);
    // 3. Comisión = Total × 1.5% (Tasa fija de servicio)
    const commission = total.multiply(0.015);
    // 4. Monto a Depositar = Monto Adelantado − Comisión
    const deposit = advanced.subtract(commission);

    return { totalAmount: total, advancedAmount: advanced, commission, depositAmount: deposit };
  }

  // Getters para exponer atributos de forma inmutable
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
