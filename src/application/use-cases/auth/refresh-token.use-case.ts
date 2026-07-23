import { randomUUID } from 'crypto';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { TokenService } from '../../ports/token-service.interface';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import {
  TokenRevokedException,
  UnauthorizedException,
} from '../../exceptions/auth.exceptions';
import { LoginUserResponse } from './login-user.use-case';

export interface RefreshTokenCommand {
  refreshToken: string;
}

/**
 * CASO DE USO: Refrescar Token (RefreshTokenUseCase)
 * Capa: Aplicación (Application Layer)
 * 
 * Aplica Rotación Estricta de Refresh Token (Token Rotation):
 * 1. Valida firma del token.
 * 2. Busca el hash en base de datos.
 * 3. Si el token está revocado/expirado, revoca todas las sesiones del usuario por seguridad.
 * 4. Invalida el token actual y genera un par completamente nuevo.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<LoginUserResponse> {
    if (!command.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload;
    try {
      payload = await this.tokenService.verifyRefreshToken(command.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokenHash = await this.tokenService.hashToken(command.refreshToken);
    const tokenEntity = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!tokenEntity || !tokenEntity.isValid()) {
      // Intento de rehuso de token revocado: revocar todas las sesiones del usuario por sospecha de robo
      await this.refreshTokenRepository.revokeAllForUser(payload.sub);
      throw new TokenRevokedException();
    }

    // Revocar el token actual usado
    tokenEntity.revoke();
    await this.refreshTokenRepository.save(tokenEntity);

    // Verificar usuario
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.valueIsActive) {
      throw new UnauthorizedException('User account is inactive or no longer exists');
    }

    // Generar nuevo par de tokens
    const newPayload = {
      sub: user.valueId,
      email: user.valueEmail.value,
      role: user.valueRole,
      clientId: user.valueClientId,
    };

    const newAccessToken = await this.tokenService.generateAccessToken(newPayload);
    const newRefreshToken = await this.tokenService.generateRefreshToken(newPayload);

    const newTokenHash = await this.tokenService.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newRefreshTokenEntity = RefreshToken.create(
      randomUUID(),
      user.valueId,
      newTokenHash,
      expiresAt,
    );

    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.valueId,
        email: user.valueEmail.value,
        name: user.valueName,
        role: user.valueRole,
        clientId: user.valueClientId,
      },
    };
  }
}
