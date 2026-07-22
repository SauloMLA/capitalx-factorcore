import { DomainException } from '../exceptions/domain.exception';

/**
 * VALUE OBJECT: Dinero (Money)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Encapsular montos monetarios y asegurar operaciones matemáticas seguras.
 * Previene los errores clásicos de coma flotante de JavaScript (ej. 0.1 + 0.2 = 0.300000000004) 
 * mediante el redondeo constante a 2 decimales y aplicando invariantes (ej. dinero no negativo).
 */
export class Money {
  private readonly amount: number;

  private constructor(amount: number) {
    // Redondea a centavos exactos para evadir fallos de coma flotante en cálculos acumulados
    this.amount = Math.round(amount * 100) / 100;
  }

  // Fábrica estática: valida que no exista dinero negativo en factoraje
  public static create(amount: number): Money {
    if (amount < 0) {
      throw new DomainException('Money amount cannot be negative');
    }
    return new Money(amount);
  }

  public get value(): number {
    return this.amount;
  }

  // Operación inmutable: devuelve una NUEVA instancia con la suma de ambos importes
  public add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  // Operación inmutable: resta montos validando que el saldo final no quede en números rojos
  public subtract(other: Money): Money {
    const diff = this.amount - other.amount;
    if (diff < 0) {
      throw new DomainException('Resulting money amount cannot be negative');
    }
    return new Money(diff);
  }

  // Multiplicación inmutable: útil para calcular aforos y comisiones
  public multiply(factor: number): Money {
    if (factor < 0) {
      throw new DomainException('Multiplication factor cannot be negative');
    }
    return new Money(this.amount * factor);
  }

  public isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }

  // Comparación estructural por valor
  public equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}
