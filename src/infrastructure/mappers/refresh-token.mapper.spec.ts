import { RefreshTokenRecord } from '@prisma/client';
import { RefreshTokenMapper } from './refresh-token.mapper';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

describe('RefreshTokenMapper', () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const sampleRecord: RefreshTokenRecord = {
    id: 'rt-1',
    userId: 'usr-1',
    tokenHash: 'hash123',
    expiresAt: futureDate,
    isRevoked: false,
    createdAt: new Date('2026-01-01'),
  };

  it('should convert RefreshTokenRecord to Domain RefreshToken correctly', () => {
    const token = RefreshTokenMapper.toDomain(sampleRecord);

    expect(token.valueId).toBe('rt-1');
    expect(token.valueUserId).toBe('usr-1');
    expect(token.valueTokenHash).toBe('hash123');
    expect(token.valueIsRevoked).toBe(false);
  });

  it('should convert Domain RefreshToken to persistence object correctly', () => {
    const token = RefreshToken.create('rt-2', 'usr-2', 'hash456', futureDate);
    const persistence = RefreshTokenMapper.toPersistence(token);

    expect(persistence).toEqual({
      id: 'rt-2',
      userId: 'usr-2',
      tokenHash: 'hash456',
      expiresAt: futureDate,
      isRevoked: false,
    });
  });
});
