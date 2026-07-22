import { DomainException } from '../exceptions/domain.exception';

/**
 * VALUE OBJECT: Porcentaje (Percentage)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Encapsular valores de porcentaje y asegurar que se encuentren dentro del límite lógico permitido (de 0 a 100).
 * Facilita operaciones matemáticas al proveer métodos de conversión a fracción decimal (ej. 85% -> 0.85).
 */
export class Percentage {
  private readonly pctValue: number;

  private constructor(value: number) {
    this.pctValue = value;
  }

  // Fábrica estática: valida la regla física de que un porcentaje no puede ser menor a 0 ni mayor a 100
  public static create(value: number): Percentage {
    if (value < 0 || value > 100) {
      throw new DomainException('Percentage value must be between 0 and 100');
    }
    return new Percentage(value);
  }

  public get value(): number {
    return this.pctValue;
  }

  // Traduce el porcentaje a factor decimal (ej: 1.5% lo convierte en 0.015) para multiplicación directa
  public toFraction(): number {
    return this.pctValue / 100;
  }

  public equals(other: Percentage): boolean {
    return this.pctValue === other.pctValue;
  }
}
