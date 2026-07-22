import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../database/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/common/value-objects/email.value-object';
import { PasswordHash } from '../../domain/common/value-objects/password-hash.value-object';
import { UserRole } from '../../domain/enums/user-role.enum';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      userRecord: {
        upsert: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    repository = new PrismaUserRepository(mockPrismaService as PrismaService);
  });

  it('should save a user using Prisma upsert', async () => {
    const user = User.create(
      'usr-1',
      Email.create('analyst@capital.mx'),
      PasswordHash.create('$2b$10$hashed'),
      'Carlos Analista',
      UserRole.ADMINISTRATOR,
    );

    await repository.save(user);

    expect(mockPrismaService.userRecord.upsert).toHaveBeenCalledWith({
      where: { id: 'usr-1' },
      create: expect.objectContaining({
        id: 'usr-1',
        email: 'analyst@capital.mx',
        role: 'ADMINISTRATOR',
      }),
      update: expect.objectContaining({
        email: 'analyst@capital.mx',
        role: 'ADMINISTRATOR',
      }),
    });
  });

  it('should find user by email', async () => {
    mockPrismaService.userRecord.findUnique.mockResolvedValue({
      id: 'usr-1',
      email: 'analyst@capital.mx',
      passwordHash: '$2b$10$hashed',
      name: 'Carlos Analista',
      role: 'ADMINISTRATOR',
      isActive: true,
      clientId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const email = Email.create('analyst@capital.mx');
    const result = await repository.findByEmail(email);

    expect(result).not.toBeNull();
    expect(result?.valueId).toBe('usr-1');
    expect(result?.valueEmail.value).toBe('analyst@capital.mx');
  });

  it('should return null if user is not found', async () => {
    mockPrismaService.userRecord.findUnique.mockResolvedValue(null);

    const result = await repository.findById('non-existent');
    expect(result).toBeNull();
  });
});
