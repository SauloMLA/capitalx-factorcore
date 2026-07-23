import { ApplicationException } from './application.exception';

/**
 * EXCEPCIÓN: Cliente No Encontrado
 * Lógica: Ocurre cuando se busca un cliente en base de datos por ID y no existe.
 */
export class ClientNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(`Client not found: ${identifier}`);
  }
}

/**
 * EXCEPCIÓN: Cliente Ya Existe
 * Lógica: Ocurre cuando se intenta registrar un cliente con un RFC que ya está tomado.
 */
export class ClientAlreadyExistsException extends ApplicationException {
  constructor(rfc: string) {
    super(`A client with RFC ${rfc} already exists`);
  }
}
