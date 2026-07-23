import { randomUUID } from 'crypto';
import { Operation } from '../../domain/entities/operation.entity';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceFolio } from '../../domain/common/value-objects/invoice-folio.value-object';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { Money } from '../../domain/common/value-objects/money.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

// Estructura de entrada para las facturas a financiar
export interface InvoiceInput {
  folio: string;
  debtorRfc: string;
  debtorName: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
}

// Comando estructurado para la creación de una operación
export interface CreateOperationCommand {
  clientId: string;
  requestDate: Date;
  invoices: InvoiceInput[];
}

// Estructura del resultado devuelto por el caso de uso
export interface OperationResult {
  operationId: string;
  totalAmount: number;
  advancedAmount: number;
  commission: number;
  depositAmount: number;
}

/**
 * CASO DE USO: Crear Operación (Originación de Factoraje)
 * Capa: Aplicación (Application Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Orquestar todo el flujo necesario para financiar un lote de facturas.
 * Se encarga de:
 * 1. Buscar al cliente y lanzar error si no existe.
 * 2. Cargar el historial de folios ya financiados por este cliente para evitar fraudes/duplicados.
 * 3. Instanciar los Value Objects e Invoices necesarios.
 * 4. Delegar la validación financiera y el cálculo del aforo/comisión al agregado Operation.
 * 5. Guardar la operación en la base de datos de manera atómica si las validaciones de negocio pasaron.
 */
export class CreateOperationUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly operationRepository: OperationRepository,
  ) {}

  async execute(command: CreateOperationCommand): Promise<OperationResult> {
    // 1. Obtener al cliente desde la base de datos
    const client = await this.clientRepository.findById(command.clientId);
    if (!client) {
      throw new ClientNotFoundException(command.clientId);
    }

    // 2. Traer folios financiados históricamente por este cliente
    const existingFolios = await this.operationRepository.findFoliosByClientId(command.clientId);

    // 3. Crear instancias de entidades Invoice y sus Value Objects
    const invoices = command.invoices.map((inv) =>
      Invoice.create(
        randomUUID(),
        InvoiceFolio.create(inv.folio),
        TaxId.create(inv.debtorRfc),
        inv.debtorName,
        Money.create(inv.amount),
        inv.issueDate,
        inv.dueDate,
      ),
    );

    // 4. Crear la Operación (Aggregate Root). Ejecuta todas las validaciones financieras en memoria
    const operation = Operation.create(
      randomUUID(),
      client,
      invoices,
      command.requestDate,
      existingFolios,
    );

    // 5. Persistir la operación y facturas en la base de datos
    await this.operationRepository.save(operation);

    return {
      operationId: operation.valueId,
      totalAmount: operation.valueTotalAmount.value,
      advancedAmount: operation.valueAdvancedAmount.value,
      commission: operation.valueCommission.value,
      depositAmount: operation.valueDepositAmount.value,
    };
  }
}
