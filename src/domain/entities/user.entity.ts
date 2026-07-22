import { Email } from '../common/value-objects/email.value-object';
import { PasswordHash } from '../common/value-objects/password-hash.value-object';
import { UserRole } from '../enums/user-role.enum';
import { DomainException } from '../common/exceptions/domain.exception';

/**
 * ENTIDAD: Usuario (User)
 * Capa: Dominio (Domain Layer)
 * 
 * Representa a un operador o administrador de la plataforma SaaS.
 * Guarda su identidad, credenciales cifradas, nombre, rol y asignación a una empresa (clientId).
 */
export class User {
  private readonly id: string;
  private readonly email: Email;
  private passwordHash: PasswordHash;
  private name: string;
  private role: UserRole;
  private isActive: boolean;
  private readonly clientId: string | null;
  private readonly createdAt: Date;

  private constructor(
    id: string,
    email: Email,
    passwordHash: PasswordHash,
    name: string,
    role: UserRole,
    isActive: boolean,
    clientId: string | null,
    createdAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.name = name;
    this.role = role;
    this.isActive = isActive;
    this.clientId = clientId;
    this.createdAt = createdAt;
  }

  // Fábrica estática para la creación inicial de un nuevo usuario
  public static create(
    id: string,
    email: Email,
    passwordHash: PasswordHash,
    name: string,
    role: UserRole,
    clientId: string | null = null,
  ): User {
    if (!id || id.trim().length === 0) {
      throw new DomainException('User ID cannot be empty');
    }
    if (!name || name.trim().length === 0) {
      throw new DomainException('User name cannot be empty');
    }
    if (!role) {
      throw new DomainException('User role is required');
    }

    return new User(
      id,
      email,
      passwordHash,
      name.trim(),
      role,
      true, // Todo usuario inicia activo por defecto
      clientId ? clientId.trim() : null,
      new Date(),
    );
  }

  // Reconstitución desde la base de datos (Persistencia)
  public static reconstitute(
    id: string,
    email: Email,
    passwordHash: PasswordHash,
    name: string,
    role: UserRole,
    isActive: boolean,
    clientId: string | null,
    createdAt: Date,
  ): User {
    return new User(id, email, passwordHash, name, role, isActive, clientId, createdAt);
  }

  public get valueId(): string {
    return this.id;
  }

  public get valueEmail(): Email {
    return this.email;
  }

  public get valuePasswordHash(): PasswordHash {
    return this.passwordHash;
  }

  public get valueName(): string {
    return this.name;
  }

  public get valueRole(): UserRole {
    return this.role;
  }

  public get valueIsActive(): boolean {
    return this.isActive;
  }

  public get valueClientId(): string | null {
    return this.clientId;
  }

  public get valueCreatedAt(): Date {
    return this.createdAt;
  }

  public isAdministrator(): boolean {
    return this.role === UserRole.ADMINISTRATOR;
  }

  public isOperator(): boolean {
    return this.role === UserRole.OPERATOR;
  }

  public deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('User is already inactive');
    }
    this.isActive = false;
  }

  public activate(): void {
    if (this.isActive) {
      throw new DomainException('User is already active');
    }
    this.isActive = true;
  }

  public updatePassword(newPasswordHash: PasswordHash): void {
    this.passwordHash = newPasswordHash;
  }

  public updateRole(newRole: UserRole): void {
    if (!newRole) {
      throw new DomainException('Role cannot be empty');
    }
    this.role = newRole;
  }
}
