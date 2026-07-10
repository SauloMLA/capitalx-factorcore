import { Operation } from '../../domain/entities/operation.entity';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceFolio } from '../../domain/common/value-objects/invoice-folio.value-object';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { Money } from '../../domain/common/value-objects/money.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

export interface InvoiceInput {
  id: string;
  folio: string;
  debtorRfc: string;
  debtorName: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
}

export interface CreateOperationCommand {
  operationId: string;
  clientId: string;
  requestDate: Date;
  invoices: InvoiceInput[];
}

export interface OperationResult {
  operationId: string;
  totalAmount: number;
  advancedAmount: number;
  commission: number;
  depositAmount: number;
}

export class CreateOperationUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly operationRepository: OperationRepository,
  ) {}

  async execute(command: CreateOperationCommand): Promise<OperationResult> {
    // 1. Resolve client — use case responsibility
    const client = await this.clientRepository.findById(command.clientId);
    if (!client) {
      throw new ClientNotFoundException(command.clientId);
    }

    // 2. Fetch existing financed folios for duplicate-check — use case responsibility
    const existingFolios = await this.operationRepository.findFoliosByClientId(command.clientId);

    // 3. Build Invoice entities — Value Objects validate their own fields
    const invoices = command.invoices.map((inv) =>
      Invoice.create(
        inv.id,
        InvoiceFolio.create(inv.folio),
        TaxId.create(inv.debtorRfc),
        inv.debtorName,
        Money.create(inv.amount),
        inv.issueDate,
        inv.dueDate,
      ),
    );

    // 4. Delegate business validation and calculation to the Operation aggregate
    //    Operation.create throws OperationValidationException (with all errors) if any rule fails
    const operation = Operation.create(
      command.operationId,
      client,
      invoices,
      command.requestDate,
      existingFolios,
    );

    // 5. Persist only once validation and calculation have succeeded
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
