import { ApplicationException } from './application.exception';

export class ClientNotFoundException extends ApplicationException {
  constructor(identifier: string) {
    super(`Client not found: ${identifier}`);
  }
}

export class ClientAlreadyExistsException extends ApplicationException {
  constructor(rfc: string) {
    super(`A client with RFC ${rfc} already exists`);
  }
}
