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
}

/**
 * CASO DE USO: Registrar Cliente
 * Capa: Aplicación (Application Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Orquestar el flujo para crear una nueva cuenta de cliente (empresa) en el sistema.
 * Asegura la unicidad del RFC antes de dar de alta al cliente.
 * 
 * Defensa en entrevista:
 * "Esta clase implementa la lógica de orquestación de registro de cliente.
 * Utiliza TaxId para validar la estructura fiscal y pregunta al repositorio si ese RFC ya existe, 
 * arrojando un ClientAlreadyExistsException si está en uso. Llama al constructor de negocio Client.create 
 * y luego persiste la entidad."
 */
export class RegisterClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

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

    return { id: clientId };
  }
}
