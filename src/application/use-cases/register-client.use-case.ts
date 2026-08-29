import { randomUUID } from 'crypto';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { ClientAlreadyExistsException } from '../exceptions/client.exceptions';

/**
 * Entrada estructurada (Comando) para registrar un cliente.
 */
export interface RegisterClientCommand {
  rfc: string;
  name: string;
  email: string;
  performedBy: string;
  ip?: string;
  userAgent?: string;
}

/**
 * CASO DE USO: Registrar Cliente
 * Capa: Aplicación (Application Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Orquestar el flujo para crear una nueva cuenta de cliente (empresa) en el sistema.
 * Asegura la unicidad del RFC antes de dar de alta al cliente.
 */
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

export class RegisterClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(command: RegisterClientCommand): Promise<{ id: string }> {
    // 1. Validar sintaxis del RFC (TaxId)
    const taxId = TaxId.create(command.rfc);

    // 2. Verificar regla de unicidad de RFC en base de datos
    const existing = await this.clientRepository.findByTaxId(taxId);
    if (existing) {
      throw new ClientAlreadyExistsException(taxId.value);
    }

    // 3. Crear la entidad Client (nace en estado PENDING) y guardarla en base de datos
    const clientId = randomUUID();
    const client = Client.create(clientId, taxId, command.name, command.email);
    await this.clientRepository.save(client);

    // 4. Registrar auditoría
    const auditLog = new AuditLog({
      id: randomUUID(),
      entity: 'Client',
      entityId: clientId,
      action: 'CREATE',
      performedBy: command.performedBy,
      newValue: JSON.stringify({ rfc: command.rfc, name: command.name, email: command.email }),
      ip: command.ip,
      userAgent: command.userAgent,
    });
    await this.auditLogRepository.save(auditLog);

    return { id: clientId };
  }
}
