import { ClientRecord } from '@prisma/client';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientStatus } from '../../domain/enums/client-status.enum';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

/**
 * Manual bi-directional mapper between the Prisma ClientRecord (persistence model)
 * and the Client domain aggregate.
 *
 * This is the ONLY file that knows about both layers simultaneously.
 * If the database schema changes, only this file needs to change.
 */
export class ClientMapper {
  /**
   * Reconstructs a domain Client from a Prisma record.
   * Uses Client.reconstitute to bypass PENDING-only creation rule
   * and restore the persisted status faithfully.
   */
  static toDomain(record: ClientRecord): Client {
    const taxId = TaxId.create(record.rfc);
    const status = record.status as ClientStatus;

    if (!Object.values(ClientStatus).includes(status)) {
      throw new DomainException(`Unknown client status from persistence: ${record.status}`);
    }

    return Client.reconstitute(record.id, taxId, record.name, record.email, status);
  }

  /**
   * Converts a domain Client to a plain object ready for Prisma upsert.
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
