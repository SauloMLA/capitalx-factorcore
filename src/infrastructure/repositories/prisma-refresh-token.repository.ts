import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { PrismaService } from '../database/prisma.service';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(token: RefreshToken): Promise<void> {
    const data = RefreshTokenMapper.toPersistence(token);

    await this.prisma.refreshTokenRecord.upsert({
      where: { id: data.id },
      create: data,
      update: {
        isRevoked: data.isRevoked,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const record = await this.prisma.refreshTokenRecord.findUnique({
      where: { tokenHash },
    });
    if (!record) return null;
    return RefreshTokenMapper.toDomain(record);
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const records = await this.prisma.refreshTokenRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(RefreshTokenMapper.toDomain);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshTokenRecord.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
