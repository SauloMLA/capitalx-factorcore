import { Client } from '../entities/client.entity';
import { TaxId } from '../common/value-objects/tax-id.value-object';

/**
 * INTERFAZ: Repositorio de Clientes (Puerto)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Definir el contrato abstracto de persistencia para la entidad Client.
 * Indica qué operaciones se pueden hacer en la base de datos sin atarse a ninguna tecnología concreta.
 */
export interface ClientRepository {
  // Guarda o actualiza un cliente
  save(client: Client): Promise<void>;
  // Busca un cliente por su ID único
  findById(id: string): Promise<Client | null>;
  // Busca un cliente por su RFC (TaxId) para validación de unicidad
  findByTaxId(taxId: TaxId): Promise<Client | null>;
}
