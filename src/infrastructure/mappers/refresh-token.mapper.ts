import { RefreshTokenRecord } from '@prisma/client';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

/**
 * MAPPER DE REFRESH TOKEN (RefreshTokenMapper)
 * Capa: Infraestructura (Infrastructure Layer)
 */
export class RefreshTokenMapper {
  static toDomain(record: RefreshTokenRecord): RefreshToken {
    return RefreshToken.reconstitute(
      record.id,
      record.userId,
      record.tokenHash,
      record.expiresAt,
      record.isRevoked,
      record.createdAt,
    );
  }

  static toPersistence(entity: RefreshToken): {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    isRevoked: boolean;
  } {
    return {
      id: entity.valueId,
      userId: entity.valueUserId,
      tokenHash: entity.valueTokenHash,
      expiresAt: entity.valueExpiresAt,
      isRevoked: entity.valueIsRevoked,
    };
  }
}
