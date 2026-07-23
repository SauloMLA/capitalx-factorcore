import { RefreshToken } from '../entities/refresh-token.entity';

/**
 * INTERFAZ: Repositorio de Tokens de Refresco (Puerto)
 * Capa: Dominio (Domain Layer)
 */
export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  revokeAllForUser(userId: string): Promise<void>;
}
