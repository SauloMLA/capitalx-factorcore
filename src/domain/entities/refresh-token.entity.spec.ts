import { RefreshToken } from './refresh-token.entity';
import { DomainException } from '../common/exceptions/domain.exception';

describe('RefreshToken Entity', () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  it('should create a valid refresh token', () => {
    const token = RefreshToken.create('rt-1', 'usr-1', 'hash123', futureDate);

    expect(token.valueId).toBe('rt-1');
    expect(token.valueUserId).toBe('usr-1');
    expect(token.valueTokenHash).toBe('hash123');
    expect(token.valueIsRevoked).toBe(false);
    expect(token.isValid()).toBe(true);
  });

  it('should throw DomainException if expiration is in the past', () => {
    const pastDate = new Date(Date.now() - 1000);
    expect(() => RefreshToken.create('rt-1', 'usr-1', 'hash123', pastDate)).toThrow(
      DomainException,
    );
  });

  it('should revoke token correctly and throw if already revoked', () => {
    const token = RefreshToken.create('rt-1', 'usr-1', 'hash123', futureDate);
    expect(token.valueIsRevoked).toBe(false);

    token.revoke();
    expect(token.valueIsRevoked).toBe(true);
    expect(token.isValid()).toBe(false);

    expect(() => token.revoke()).toThrow('RefreshToken is already revoked');
  });
});
