import { OperationRecord, InvoiceRecord } from '@prisma/client';
import { Operation } from '../../domain/entities/operation.entity';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceFolio } from '../../domain/common/value-objects/invoice-folio.value-object';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { Money } from '../../domain/common/value-objects/money.value-object';

// Tipo de utilidad que combina un registro de Operación con su listado de Facturas físicas (JOIN de base de datos)
export type OperationRecordWithInvoices = OperationRecord & { invoices: InvoiceRecord[] };

/**
 * MAPPER DE OPERACIÓN (OperationMapper)
 * Capa: Infraestructura (Infrastructure Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Traducir el Agregado de Dominio `Operation` (que contiene entidades ricas y lógica de negocio) 
 * a tablas planas de persistencia (`OperationRecord` e `InvoiceRecord`) y viceversa.
 */
export class OperationMapper {
  /**
   * Traduce de persistencia a Dominio (Lectura).
   * Convierte la operación relacional y sus facturas asociadas a entidades de dominio reconstituidas.
   */
  static toDomain(record: OperationRecordWithInvoices): Operation {
    // 1. Mapear y reconstituir cada factura individual
    const invoices = record.invoices.map((inv: any) =>
      Invoice.reconstitute(
        inv.id,
        InvoiceFolio.create(inv.folio),
        TaxId.create(inv.debtorRfc, { allowPhysicalPerson: true }),
        inv.debtorName,
        Money.create(Number(inv.amount)),
        new Date(inv.issueDate),
        new Date(inv.dueDate),
      ),
    );

    // 2. Reconstituir el Agregado de la Operación con sus facturas y montos guardados
    return Operation.reconstitute(
      record.id,
      record.clientId,
      invoices,
      Money.create(Number(record.totalAmount)),
      Money.create(Number(record.advancedAmount)),
      Money.create(Number(record.commission)),
      Money.create(Number(record.depositAmount)),
    );
  }

  /**
   * Traduce de Dominio a persistencia (Escritura).
   * Desestructura el Agregado Operation para producir dos registros planos listos para las tablas SQL.
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
    // Registro plano de la operación
    const operationRecord = {
      id: operation.valueId,
      clientId: operation.valueClientId,
      totalAmount: operation.valueTotalAmount.value,
      advancedAmount: operation.valueAdvancedAmount.value,
      commission: operation.valueCommission.value,
      depositAmount: operation.valueDepositAmount.value,
    };

    // Arreglo de registros planos de facturas individuales
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
