import { randomUUID } from 'crypto';
import { Email } from '../../../domain/common/value-objects/email.value-object';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { PasswordHasher } from '../../ports/password-hasher.interface';
import { TokenService } from '../../ports/token-service.interface';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import {
  InvalidCredentialsException,
  UserInactiveException,
} from '../../exceptions/auth.exceptions';
import { UserRole } from '../../../domain/enums/user-role.enum';

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    clientId: string | null;
  };
}

/**
 * CASO DE USO: Login de Usuario
 * Capa: Aplicación (Application Layer)
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    const emailVO = Email.create(command.email);

    const user = await this.userRepository.findByEmail(emailVO);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.valueIsActive) {
      throw new UserInactiveException();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.valuePasswordHash.value,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = {
      sub: user.valueId,
      email: user.valueEmail.value,
      role: user.valueRole,
      clientId: user.valueClientId,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    const tokenHash = await this.tokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const refreshTokenEntity = RefreshToken.create(
      randomUUID(),
      user.valueId,
      tokenHash,
      expiresAt,
    );

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
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
