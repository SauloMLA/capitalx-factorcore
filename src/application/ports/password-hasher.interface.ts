/**
 * PUERTO: Servicio de Cifrado de Contraseñas (PasswordHasher)
 * Capa: Aplicación (Application Layer)
 * 
 * Contrato abstracto para el hash y comparación de contraseñas.
 */
export interface PasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
