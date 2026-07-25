import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../domain/common/value-objects/password-hash.value-object';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../ports/password-hasher.interface';
import { UserAlreadyExistsException } from '../exceptions/user.exceptions';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

export interface RegisterUserCommand {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clientId?: string | null;
  performedBy: string;
  ip?: string;
  userAgent?: string;
}

/**
 * CASO DE USO: Registrar Usuario
 * Capa: Aplicación (Application Layer)
 * 
 * Orquesta la creación de un nuevo usuario en la plataforma.
 * Valida la unicidad del email, encripta la contraseña usando el puerto PasswordHasher,
 * construye la entidad User y la persiste.
 */
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ id: string }> {
    // 1. Validar formato de email
    const emailVO = Email.create(command.email);

    // 2. Validar contraseña no vacía y longitud mínima (ej. 8 caracteres)
    if (!command.password || command.password.length < 8) {
      throw new DomainException('Password must be at least 8 characters long');
    }

    // 3. Verificar que el email no esté en uso
    const existing = await this.userRepository.findByEmail(emailVO);
    if (existing) {
      throw new UserAlreadyExistsException(emailVO.value);
    }

    // 4. Hashear la contraseña mediante el puerto abstracto
    const hashed = await this.passwordHasher.hash(command.password);
    const passwordHashVO = PasswordHash.create(hashed);

    // 5. Crear la entidad de Dominio User y persistir
    const userId = randomUUID();
    const user = User.create(
      userId,
      emailVO,
      passwordHashVO,
      command.name,
      command.role,
      command.clientId || null,
    );

    await this.userRepository.save(user);

    // 6. Registrar auditoría
    const auditLog = new AuditLog({
      id: randomUUID(),
      entity: 'User',
      entityId: userId,
      action: 'CREATE',
      performedBy: command.performedBy,
      newValue: JSON.stringify({ email: command.email, role: command.role }),
      ip: command.ip,
      userAgent: command.userAgent,
    });
    await this.auditLogRepository.save(auditLog);

    return { id: userId };
  }
}
