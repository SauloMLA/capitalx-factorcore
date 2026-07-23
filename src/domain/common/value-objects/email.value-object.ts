import { DomainException } from '../exceptions/domain.exception';

/**
 * VALUE OBJECT: Correo Electrónico (Email)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Validar y encapsular el formato de correo electrónico de forma inmutable.
 */
export class Email {
  private readonly emailValue: string;

  private constructor(value: string) {
    this.emailValue = value;
  }

  public static create(value: string): Email {
    if (!value || value.trim().length === 0) {
      throw new DomainException('Email cannot be empty');
    }

    const normalized = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(normalized)) {
      throw new DomainException('Invalid email address format');
    }

    return new Email(normalized);
  }

  public get value(): string {
    return this.emailValue;
  }

  public equals(other: Email): boolean {
    return this.emailValue === other.emailValue;
  }
}
