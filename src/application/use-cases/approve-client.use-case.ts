import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

/**
 * Comando para aprobar un cliente específico.
 */
export interface ApproveClientCommand {
  clientId: string;
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
export class ApproveClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(command: ApproveClientCommand): Promise<void> {
    // 1. Obtener al cliente desde el repositorio
    const client = await this.clientRepository.findById(command.clientId);
    if (!client) {
      throw new ClientNotFoundException(command.clientId);
    }

    // 2. Ejecutar la acción en la entidad de Dominio y guardar
    client.approve();
    await this.clientRepository.save(client);
  }
}
