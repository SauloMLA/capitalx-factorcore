/**
 * TOKENS DE INYECCIÓN DE REPOSITORIOS Y PUERTOS
 * Capa: Infraestructura (Infrastructure Layer)
 */
export const REPOSITORY_TOKENS = {
  CLIENT: Symbol('CLIENT_REPOSITORY'),
  OPERATION: Symbol('OPERATION_REPOSITORY'),
  USER: Symbol('USER_REPOSITORY'),
  PASSWORD_HASHER: Symbol('PASSWORD_HASHER'),
} as const;
