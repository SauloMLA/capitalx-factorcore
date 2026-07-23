import { UserRole } from '../../domain/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  clientId: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * PUERTO: Servicio de Tokens JWT (TokenService)
 * Capa: Aplicación (Application Layer)
 * 
 * Contrato abstracto para generación y verificación de JWT Access y Refresh Tokens.
 */
export interface TokenService {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
  hashToken(token: string): Promise<string>;
}
