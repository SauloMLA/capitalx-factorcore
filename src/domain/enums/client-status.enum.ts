/**
 * ENUM: Estados del Cliente
 * Capa: Dominio (Domain Layer)
 * 
 * Define de manera tipada y segura los dos estados posibles por los que transita un cliente:
 * - PENDING: Estado inicial de registro. Aún no puede operar.
 * - APPROVED: Estado activo. Autorizado para originar operaciones de factoraje.
 */
export enum ClientStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}
