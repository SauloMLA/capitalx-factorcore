import { UserRecord } from '@prisma/client';
import { UserMapper } from './user.mapper';
import { UserRole } from '../../domain/enums/user-role.enum';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../domain/common/value-objects/password-hash.value-object';

describe('UserMapper', () => {
  const sampleRecord: UserRecord = {
    id: 'usr-1',
    email: 'user@capital.mx',
    passwordHash: '$2b$10$hashsample',
    name: 'Operador Test',
    role: 'OPERATOR',
    isActive: true,
    clientId: 'cli-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('should convert UserRecord to Domain User correctly', () => {
    const user = UserMapper.toDomain(sampleRecord);

    expect(user.valueId).toBe('usr-1');
    expect(user.valueEmail.value).toBe('user@capital.mx');
    expect(user.valuePasswordHash.value).toBe('$2b$10$hashsample');
    expect(user.valueName).toBe('Operador Test');
    expect(user.valueRole).toBe(UserRole.OPERATOR);
    expect(user.valueIsActive).toBe(true);
    expect(user.valueClientId).toBe('cli-1');
  });

  it('should convert Domain User to persistence object correctly', () => {
    const user = User.create(
      'usr-2',
      Email.create('admin@capital.mx'),
      PasswordHash.create('$2b$10$hashadmin'),
      'Admin Test',
      UserRole.ADMINISTRATOR,
      null,
    );

    const persistence = UserMapper.toPersistence(user);

    expect(persistence).toEqual({
      id: 'usr-2',
      email: 'admin@capital.mx',
      passwordHash: '$2b$10$hashadmin',
      name: 'Admin Test',
      role: 'ADMINISTRATOR',
      isActive: true,
      clientId: null,
    });
  });
});
