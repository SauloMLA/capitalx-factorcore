import { Operation } from '../entities/operation.entity';

/**
 * INTERFAZ: Repositorio de Operaciones (Puerto)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Definir el contrato abstracto de persistencia para la entidad/agregado Operation.
 * Declara las operaciones de lectura/escritura necesarias sin acoplarse a base de datos.
 */
export interface OperationRepository {
  // Guarda una operación y sus facturas asociadas de manera atómica
  save(operation: Operation): Promise<void>;
  // Busca una operación por su ID único con sus facturas incluidas
  findById(id: string): Promise<Operation | null>;
  // Devuelve la lista histórica de folios de facturas ya financiados por el cliente
  findFoliosByClientId(clientId: string): Promise<string[]>;
  // Devuelve todas las operaciones asociadas a un cliente específico
  findByClientId(clientId: string): Promise<Operation[]>;
}
