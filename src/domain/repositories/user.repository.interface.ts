import { User } from '../entities/user.entity';
import { Email } from '../common/value-objects/email.value-object';

/**
 * INTERFAZ: Repositorio de Usuarios (Puerto)
 * Capa: Dominio (Domain Layer)
 * 
 * Define el contrato de persistencia para la entidad User.
 */
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(): Promise<User[]>;
}
