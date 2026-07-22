/**
 * ENUM: Roles de Usuario (UserRole)
 * Capa: Dominio (Domain Layer)
 * 
 * Define los tipos de operadores reconocidos por las reglas del negocio:
 * - ADMINISTRATOR: Analistas de Mesa de Control con permisos de aprobación y administración.
 * - OPERATOR: Usuarios operativos que registran clientes y originan operaciones de factoraje.
 */
export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  OPERATOR = 'OPERATOR',
}
