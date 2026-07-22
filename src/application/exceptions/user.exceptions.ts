/**
 * EXCEPCIÓN DE APLICACIÓN: El correo de usuario ya está registrado.
 */
export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`User with email '${email}' already exists in the system`);
    this.name = 'UserAlreadyExistsException';
  }
}

/**
 * EXCEPCIÓN DE APLICACIÓN: Usuario no encontrado.
 */
export class UserNotFoundException extends Error {
  constructor(identifier: string) {
    super(`User '${identifier}' was not found`);
    this.name = 'UserNotFoundException';
  }
}
