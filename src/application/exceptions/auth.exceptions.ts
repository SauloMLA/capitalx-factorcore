export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid email or password credentials');
    this.name = 'InvalidCredentialsException';
  }
}

export class UnauthorizedException extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class TokenRevokedException extends Error {
  constructor() {
    super('Refresh token has been revoked or expired');
    this.name = 'TokenRevokedException';
  }
}

export class UserInactiveException extends Error {
  constructor() {
    super('User account is inactive. Contact system administrator');
    this.name = 'UserInactiveException';
  }
}
