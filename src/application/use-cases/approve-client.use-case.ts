import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

/**
 * Comando para aprobar un cliente específico.
 */
export interface ApproveClientCommand {
  clientId: string;
  performedBy: string;
  ip?: string;
  userAgent?: string;
}

/**
 * CASO DE USO: Aprobar Cliente
 * Capa: Aplicación (Application Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Orquestar la transición de un cliente de estado PENDING a APPROVED.
 * 
 * Defensa en entrevista:
 * "El caso de uso busca al cliente en el repositorio. Si no existe, lanza ClientNotFoundException.
 * Si existe, delega el cambio de estado a la entidad Client llamando a `.approve()`.
 * Es la propia entidad Client la que protege su estado para no ser aprobada dos veces (regla de negocio).
 * Luego de la aprobación, guardamos los cambios a través del repositorio."
 */
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

export class ApproveClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(command: ApproveClientCommand): Promise<void> {
    // 1. Obtener al cliente desde el repositorio
    const client = await this.clientRepository.findById(command.clientId);
    if (!client) {
      throw new ClientNotFoundException(command.clientId);
    }

    // 2. Ejecutar la acción en la entidad de Dominio y guardar
    const oldStatus = client.valueStatus;
    client.approve();
    await this.clientRepository.save(client);

    // 3. Registrar auditoría
    const auditLog = new AuditLog({
      id: crypto.randomUUID(),
      entity: 'Client',
      entityId: client.valueId,
      action: 'APPROVE',
      performedBy: command.performedBy,
      oldValue: JSON.stringify({ status: oldStatus }),
      newValue: JSON.stringify({ status: client.valueStatus }),
      ip: command.ip,
      userAgent: command.userAgent,
    });
    await this.auditLogRepository.save(auditLog);
  }
}
