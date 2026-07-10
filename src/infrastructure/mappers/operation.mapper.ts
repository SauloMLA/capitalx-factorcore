import { OperationRecord, InvoiceRecord } from '@prisma/client';
import { Operation } from '../../domain/entities/operation.entity';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceFolio } from '../../domain/common/value-objects/invoice-folio.value-object';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { Money } from '../../domain/common/value-objects/money.value-object';

export type OperationRecordWithInvoices = OperationRecord & { invoices: InvoiceRecord[] };

/**
 * Manual bi-directional mapper between Prisma OperationRecord (with nested invoices)
 * and the Operation domain aggregate.
 *
 * This is the ONLY file that knows about both layers simultaneously.
 * Keeps calculated amounts in the persistence layer to avoid re-computing on every read.
 */
export class OperationMapper {
  /**
   * Reconstructs an Operation aggregate from a Prisma record with its invoices.
   * Uses Operation.reconstitute to skip re-validation — the data was already
   * validated when the operation was first created.
   */
  static toDomain(record: OperationRecordWithInvoices): Operation {
    const invoices = record.invoices.map((inv) =>
      Invoice.reconstitute(
        inv.id,
        InvoiceFolio.create(inv.folio),
        TaxId.create(inv.debtorRfc),
        inv.debtorName,
        Money.create(inv.amount),
        new Date(inv.issueDate),
        new Date(inv.dueDate),
      ),
    );

    return Operation.reconstitute(
      record.id,
      record.clientId,
      invoices,
      Money.create(record.totalAmount),
      Money.create(record.advancedAmount),
      Money.create(record.commission),
      Money.create(record.depositAmount),
    );
  }

  /**
   * Converts an Operation aggregate to a plain persistence object.
   * Amounts are extracted from the domain Money value objects.
   */
  static toPersistence(operation: Operation): {
    operationRecord: {
      id: string;
      clientId: string;
      totalAmount: number;
      advancedAmount: number;
      commission: number;
      depositAmount: number;
    };
    invoiceRecords: Array<{
      id: string;
      operationId: string;
      folio: string;
      debtorRfc: string;
      debtorName: string;
      amount: number;
      issueDate: Date;
      dueDate: Date;
    }>;
  } {
    const operationRecord = {
      id: operation.valueId,
      clientId: operation.valueClientId,
      totalAmount: operation.valueTotalAmount.value,
      advancedAmount: operation.valueAdvancedAmount.value,
      commission: operation.valueCommission.value,
      depositAmount: operation.valueDepositAmount.value,
    };

    const invoiceRecords = operation.valueInvoices.map((inv) => ({
      id: inv.valueId,
      operationId: operation.valueId,
      folio: inv.valueFolio.value,
      debtorRfc: inv.valueDebtorTaxId.value,
      debtorName: inv.valueDebtorName,
      amount: inv.valueAmount.value,
      issueDate: inv.valueIssueDate,
      dueDate: inv.valueDueDate,
    }));

    return { operationRecord, invoiceRecords };
  }
}
