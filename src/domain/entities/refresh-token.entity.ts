import { DomainException } from '../common/exceptions/domain.exception';

/**
 * ENTIDAD: Token de Refresco (RefreshToken)
 * Capa: Dominio (Domain Layer)
 * 
 * Representa la sesión persistida de un usuario para rotación y revocación segura de JWT.
 */
export class RefreshToken {
  private readonly id: string;
  private readonly userId: string;
  private readonly tokenHash: string;
  private readonly expiresAt: Date;
  private isRevoked: boolean;
  private readonly createdAt: Date;

  private constructor(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    isRevoked: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
    this.isRevoked = isRevoked;
    this.createdAt = createdAt;
  }

  public static create(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): RefreshToken {
    if (!id || id.trim().length === 0) {
      throw new DomainException('RefreshToken ID cannot be empty');
    }
    if (!userId || userId.trim().length === 0) {
      throw new DomainException('UserId cannot be empty');
    }
    if (!tokenHash || tokenHash.trim().length === 0) {
      throw new DomainException('TokenHash cannot be empty');
    }
    if (!expiresAt || expiresAt.getTime() <= Date.now()) {
      throw new DomainException('ExpiresAt must be in the future');
    }

    return new RefreshToken(id, userId, tokenHash, expiresAt, false, new Date());
  }

  public static reconstitute(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    isRevoked: boolean,
    createdAt: Date,
  ): RefreshToken {
    return new RefreshToken(id, userId, tokenHash, expiresAt, isRevoked, createdAt);
  }

  public get valueId(): string {
    return this.id;
  }

  public get valueUserId(): string {
    return this.userId;
  }

  public get valueTokenHash(): string {
    return this.tokenHash;
  }

  public get valueExpiresAt(): Date {
    return this.expiresAt;
  }

  public get valueIsRevoked(): boolean {
    return this.isRevoked;
  }

  public get valueCreatedAt(): Date {
    return this.createdAt;
  }

  public isExpired(now: Date = new Date()): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }

  public isValid(now: Date = new Date()): boolean {
    return !this.isRevoked && !this.isExpired(now);
  }

  public revoke(): void {
    if (this.isRevoked) {
      throw new DomainException('RefreshToken is already revoked');
    }
    this.isRevoked = true;
  }
}
