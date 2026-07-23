/**
 * EXCEPCIÓN BASE DE APLICACIÓN
 * Capa: Aplicación (Application Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Servir como la clase base de error para cualquier fallo que ocurra durante la orquestación 
 * o flujo de trabajo (ej. "el cliente no existe en la base de datos", "recurso duplicado").
 * 
 * Defensa en entrevista:
 * "Hereda de Error nativo e implementa setPrototypeOf para corregir la herencia de clases nativas en JS.
 * El HttpFilter detecta los errores que heredan de ApplicationException para responder con códigos 
 * HTTP adecuados en lugar de un error 500."
 */
export class ApplicationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Corrige la cadena de prototipos para compatibilidad de instanceof
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
