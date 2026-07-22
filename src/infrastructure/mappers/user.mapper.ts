import { UserRecord } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../domain/common/value-objects/password-hash.value-object';
import { UserRole } from '../../domain/enums/user-role.enum';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

/**
 * MAPPER DE USUARIO (UserMapper)
 * Capa: Infraestructura (Infrastructure Layer)
 * 
 * Traductor bidireccional entre `UserRecord` de Prisma y la Entidad de Dominio `User`.
 */
export class UserMapper {
  static toDomain(record: UserRecord): User {
    const email = Email.create(record.email);
    const passwordHash = PasswordHash.create(record.passwordHash);
    const role = record.role as UserRole;

    if (!Object.values(UserRole).includes(role)) {
      throw new DomainException(`Unknown user role from persistence: ${record.role}`);
    }

    return User.reconstitute(
      record.id,
      email,
      passwordHash,
      record.name,
      role,
      record.isActive,
      record.clientId,
      record.createdAt,
    );
  }

  static toPersistence(user: User): {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    isActive: boolean;
    clientId: string | null;
  } {
    return {
      id: user.valueId,
      email: user.valueEmail.value,
      passwordHash: user.valuePasswordHash.value,
      name: user.valueName,
      role: user.valueRole,
      isActive: user.valueIsActive,
      clientId: user.valueClientId,
    };
  }
}
