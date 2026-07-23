import { DomainException } from '../exceptions/domain.exception';

/**
 * VALUE OBJECT: Hash de Contraseña (PasswordHash)
 * Capa: Dominio (Domain Layer)
 * 
 * Encapsula la contraseña ya cifrada. El Dominio no sabe si proviene de bcrypt, argon2 u otro algoritmo,
 * solo valida que el hash tenga contenido válido y no esté vacío.
 */
export class PasswordHash {
  private readonly hashValue: string;

  private constructor(value: string) {
    this.hashValue = value;
  }

  public static create(hash: string): PasswordHash {
    if (!hash || hash.trim().length === 0) {
      throw new DomainException('Password hash cannot be empty');
    }
    return new PasswordHash(hash.trim());
  }

  public get value(): string {
    return this.hashValue;
  }

  public equals(other: PasswordHash): boolean {
    return this.hashValue === other.hashValue;
  }
}
