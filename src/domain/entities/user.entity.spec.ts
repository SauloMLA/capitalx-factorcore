import { User } from './user.entity';
import { Email } from '../common/value-objects/email.value-object';
import { PasswordHash } from '../common/value-objects/password-hash.value-object';
import { UserRole } from '../enums/user-role.enum';
import { DomainException } from '../common/exceptions/domain.exception';

describe('User Entity', () => {
  const validEmail = Email.create('analyst@capital.mx');
  const validHash = PasswordHash.create('$2b$10$HASHED_PASSWORD_SAMPLE');

  it('should create a valid user instance', () => {
    const user = User.create(
      'usr-uuid-1',
      validEmail,
      validHash,
      'Carlos Analista',
      UserRole.ADMINISTRATOR,
      'cli-uuid-1',
    );

    expect(user.valueId).toBe('usr-uuid-1');
    expect(user.valueEmail.value).toBe('analyst@capital.mx');
    expect(user.valueName).toBe('Carlos Analista');
    expect(user.valueRole).toBe(UserRole.ADMINISTRATOR);
    expect(user.valueIsActive).toBe(true);
    expect(user.valueClientId).toBe('cli-uuid-1');
    expect(user.isAdministrator()).toBe(true);
    expect(user.isOperator()).toBe(false);
  });

  it('should throw DomainException if ID or Name is empty', () => {
    expect(() =>
      User.create('', validEmail, validHash, 'Carlos', UserRole.OPERATOR),
    ).toThrow(DomainException);

    expect(() =>
      User.create('usr-1', validEmail, validHash, '', UserRole.OPERATOR),
    ).toThrow(DomainException);
  });

  it('should activate and deactivate correctly', () => {
    const user = User.create('usr-1', validEmail, validHash, 'Operador', UserRole.OPERATOR);
    expect(user.valueIsActive).toBe(true);

    user.deactivate();
    expect(user.valueIsActive).toBe(false);

    expect(() => user.deactivate()).toThrow('User is already inactive');

    user.activate();
    expect(user.valueIsActive).toBe(true);
    expect(() => user.activate()).toThrow('User is already active');
  });
});
