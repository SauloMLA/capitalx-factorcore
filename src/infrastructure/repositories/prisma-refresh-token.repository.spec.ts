import { PrismaRefreshTokenRepository } from './prisma-refresh-token.repository';
import { PrismaService } from '../database/prisma.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

describe('PrismaRefreshTokenRepository', () => {
  let repository: PrismaRefreshTokenRepository;
  let mockPrismaService: any;

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    mockPrismaService = {
      refreshTokenRecord: {
        upsert: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    repository = new PrismaRefreshTokenRepository(mockPrismaService as PrismaService);
  });

  it('should save a refresh token using Prisma upsert', async () => {
    const token = RefreshToken.create('rt-1', 'usr-1', 'hash123', futureDate);

    await repository.save(token);

    expect(mockPrismaService.refreshTokenRecord.upsert).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      create: expect.objectContaining({ id: 'rt-1', userId: 'usr-1' }),
      update: expect.objectContaining({ isRevoked: false }),
    });
  });

  it('should find token by hash', async () => {
    mockPrismaService.refreshTokenRecord.findUnique.mockResolvedValue({
      id: 'rt-1',
      userId: 'usr-1',
      tokenHash: 'hash123',
      expiresAt: futureDate,
      isRevoked: false,
      createdAt: new Date(),
    });

    const result = await repository.findByTokenHash('hash123');

    expect(result).not.toBeNull();
    expect(result?.valueId).toBe('rt-1');
  });

  it('should revoke all tokens for a user', async () => {
    await repository.revokeAllForUser('usr-1');

    expect(mockPrismaService.refreshTokenRecord.updateMany).toHaveBeenCalledWith({
      where: { userId: 'usr-1', isRevoked: false },
      data: { isRevoked: true },
    });
  });
});
