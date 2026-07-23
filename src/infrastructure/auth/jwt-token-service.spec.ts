import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token-service';
import { UserRole } from '../../domain/enums/user-role.enum';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let mockJwtService: jest.Mocked<JwtService>;

  const payload = {
    sub: 'usr-1',
    email: 'user@capital.mx',
    role: UserRole.ADMINISTRATOR,
    clientId: null,
  };

  beforeEach(() => {
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('token_sample'),
      verifyAsync: jest.fn().mockResolvedValue(payload),
    } as any;

    service = new JwtTokenService(mockJwtService);
  });

  it('should generate access token', async () => {
    const token = await service.generateAccessToken(payload);
    expect(token).toBe('token_sample');
    expect(mockJwtService.signAsync).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ expiresIn: '15m' }),
    );
  });

  it('should generate refresh token', async () => {
    const token = await service.generateRefreshToken(payload);
    expect(token).toBe('token_sample');
    expect(mockJwtService.signAsync).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ expiresIn: '7d' }),
    );
  });

  it('should hash token to sha256 hex string', async () => {
    const hash = await service.hashToken('test_token');
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64);
  });
});
