import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { TokenService } from '../../ports/token-service.interface';

export interface LogoutUserCommand {
  refreshToken?: string;
  userId?: string;
}

/**
 * CASO DE USO: Logout de Usuario (LogoutUserUseCase)
 * Capa: Aplicación (Application Layer)
 * 
 * Revoca el token de refresco presentado o todas las sesiones del usuario.
 */
export class LogoutUserUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutUserCommand): Promise<void> {
    if (command.refreshToken) {
      try {
        const tokenHash = await this.tokenService.hashToken(command.refreshToken);
        const tokenEntity = await this.refreshTokenRepository.findByTokenHash(tokenHash);
        if (tokenEntity && !tokenEntity.valueIsRevoked) {
          tokenEntity.revoke();
          await this.refreshTokenRepository.save(tokenEntity);
        }
      } catch {
        // Ignorar si el token era inválido
      }
    }

    if (command.userId) {
      await this.refreshTokenRepository.revokeAllForUser(command.userId);
    }
  }
}
