import { Client } from '../entities/client.entity';
import { TaxId } from '../common/value-objects/tax-id.value-object';

export interface ClientRepository {
  save(client: Client): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findByTaxId(taxId: TaxId): Promise<Client | null>;
}
