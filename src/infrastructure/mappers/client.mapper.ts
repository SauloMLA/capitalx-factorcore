import { ClientRecord } from '@prisma/client';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientStatus } from '../../domain/enums/client-status.enum';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

/**
 * MAPPER DE CLIENTE (ClientMapper)
 * Capa: Infraestructura (Infrastructure Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Servir como traductor bidireccional entre el modelo de persistencia física de Prisma (`ClientRecord`)
 * y la entidad rica de Dominio (`Client`).
 * Es la única clase autorizada para conocer simultáneamente ambas representaciones del Cliente.
 * 
 * Defensa en entrevista:
 * "El Mapper evita el acoplamiento de la base de datos con nuestro Dominio. 
 * Si mañana cambia el nombre de la columna 'rfc' a 'registro_federal' en SQLite, solo cambiamos 
 * este archivo. El dominio y los casos de uso siguen intactos porque ellos no tocan el modelo físico."
 */
export class ClientMapper {
  /**
   * Traduce de persistencia a Dominio (Lectura).
   * Usa `Client.reconstitute` para revivir la entidad con su estado histórico guardado (ej. APPROVED).
   */
  static toDomain(record: ClientRecord): Client {
    const taxId = TaxId.create(record.rfc);
    const status = record.status as ClientStatus;

    // Validación defensiva por si la base de datos se corrompe externamente
    if (!Object.values(ClientStatus).includes(status)) {
      throw new DomainException(`Unknown client status from persistence: ${record.status}`);
    }

    return Client.reconstitute(record.id, taxId, record.name, record.email, status);
  }

  /**
   * Traduce de Dominio a persistencia (Escritura).
   * Convierte la entidad rica de Dominio en un objeto de datos plano (`Plain Object`)
   * listo para ser guardado por Prisma.
   */
  static toPersistence(client: Client): {
    id: string;
    rfc: string;
    name: string;
    email: string;
    status: string;
  } {
    return {
      id: client.valueId,
      rfc: client.valueTaxId.value,
      name: client.valueName,
      email: client.valueEmail,
      status: client.valueStatus,
    };
  }
}
