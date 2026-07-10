import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

export interface ClientSummaryResult {
  operationCount: number;
  totalAdvancedAmount: number;
  nearestDueDate: Date | null;
}

export class GetClientSummaryUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly operationRepository: OperationRepository,
  ) {}

  async execute(clientId: string): Promise<ClientSummaryResult> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundException(clientId);
    }

    const operations = await this.operationRepository.findByClientId(clientId);

    const operationCount = operations.length;

    const totalAdvancedAmount = operations.reduce(
      (sum, op) => sum + op.valueAdvancedAmount.value,
      0,
    );

    // Nearest due date: the earliest due date across all invoices in all operations
    let nearestDueDate: Date | null = null;
    for (const op of operations) {
      for (const invoice of op.valueInvoices) {
        if (!nearestDueDate || invoice.valueDueDate < nearestDueDate) {
          nearestDueDate = invoice.valueDueDate;
        }
      }
    }

    return { operationCount, totalAdvancedAmount, nearestDueDate };
  }
}
