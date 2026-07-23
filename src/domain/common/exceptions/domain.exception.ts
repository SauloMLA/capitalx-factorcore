/**
 * EXCEPCIÓN BASE DE DOMINIO
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Servir como la base para cualquier excepción de negocio que rompa las reglas e invariantes del Dominio.
 * 
 * Defensa en entrevista:
 * "Hereda de Error nativo de JavaScript. Usamos `Object.setPrototypeOf` para que el motor de JS 
 * reconozca correctamente la jerarquía de herencia cuando hacemos `instanceof DomainException`."
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Corrige el prototipo para mantener compatibilidad con instanceof en TypeScript/JS
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
