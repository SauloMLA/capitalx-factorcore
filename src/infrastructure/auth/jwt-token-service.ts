import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { TokenService, JwtPayload } from '../../application/ports/token-service.interface';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'factorcore_default_secret_key_2026';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'factorcore_default_refresh_secret_key_2026';

  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '15m', // 15 minutos
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: '7d', // 7 días
    });
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.jwtSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.refreshSecret,
    });
  }

  async hashToken(token: string): Promise<string> {
    return createHash('sha256').update(token).digest('hex');
  }
}
