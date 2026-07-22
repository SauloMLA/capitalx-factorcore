import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { OperationRepository } from '../../domain/repositories/operation.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

// Contrato de salida con las métricas consolidadas del cliente
export interface ClientSummaryResult {
  operationCount: number;
  totalAdvancedAmount: number;
  nearestDueDate: Date | null;
}

/**
 * CASO DE USO: Obtener Resumen Ejecutivo del Cliente
 * Capa: Aplicación (Application Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Consolidar y calcular métricas históricas de factoraje para un cliente en particular.
 * Extrae:
 * 1. Cantidad total de operaciones financiadas.
 * 2. Suma del monto adelantado acumulado (aforo acumulado).
 * 3. Fecha del vencimiento de factura más próximo a ocurrir en el futuro.
 */
export class GetClientSummaryUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly operationRepository: OperationRepository,
  ) {}

  async execute(clientId: string): Promise<ClientSummaryResult> {
    // 1. Validar existencia del cliente
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new ClientNotFoundException(clientId);
    }

    // 2. Obtener todas las operaciones financiadas del cliente
    const operations = await this.operationRepository.findByClientId(clientId);

    const operationCount = operations.length;

    // 3. Sumar el monto adelantado (aforo de 85%) acumulado en todo su historial
    const totalAdvancedAmount = operations.reduce(
      (sum, op) => sum + op.valueAdvancedAmount.value,
      0,
    );

    // 4. Identificar la fecha de vencimiento más próxima recorriendo todas las facturas de todas sus operaciones
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
