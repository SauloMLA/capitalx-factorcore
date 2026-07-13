import { PrismaClientRepository } from './prisma-client.repository';
import { PrismaService } from '../database/prisma.service';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientStatus } from '../../domain/enums/client-status.enum';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const NOW = new Date('2026-07-10T00:00:00Z');

const CLIENT_RECORD = {
  id: 'uuid-1',
  rfc: 'XYZ850101XXX',
  name: 'Corp S.A.',
  email: 'corp@sa.mx',
  status: 'APPROVED',
  createdAt: NOW,
  updatedAt: NOW,
};

type ClientRecordMock = {
  upsert: jest.Mock;
  findUnique: jest.Mock;
};

function mockPrisma(overrides: Partial<ClientRecordMock> = {}) {
  const clientRecordMock: ClientRecordMock = {
    upsert: jest.fn().mockResolvedValue(undefined),
    findUnique: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
  return { clientRecord: clientRecordMock } as unknown as PrismaService;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PrismaClientRepository', () => {
  it('should call prisma.clientRecord.upsert on save', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaClientRepository(prisma);

    const client = Client.reconstitute(
      'uuid-1', TaxId.create('XYZ850101XXX'), 'Corp S.A.', 'corp@sa.mx', ClientStatus.APPROVED,
    );
    await repo.save(client);

    expect(prisma.clientRecord.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.clientRecord.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'uuid-1' } }),
    );
  });

  it('should return null from findById when prisma returns null', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaClientRepository(prisma);
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('should reconstruct a domain Client from findById', async () => {
    const prisma = mockPrisma({ findUnique: jest.fn().mockResolvedValue(CLIENT_RECORD) });
    const repo = new PrismaClientRepository(prisma);
    const client = await repo.findById('uuid-1');

    expect(client).not.toBeNull();
    expect(client!.valueId).toBe('uuid-1');
    expect(client!.valueTaxId.value).toBe('XYZ850101XXX');
    expect(client!.isApproved()).toBe(true);
  });

  it('should return null from findByTaxId when prisma returns null', async () => {
    const prisma = mockPrisma();
    const repo = new PrismaClientRepository(prisma);
    const result = await repo.findByTaxId(TaxId.create('XYZ850101XXX'));
    expect(result).toBeNull();
  });

  it('should reconstruct a domain Client from findByTaxId', async () => {
    const prisma = mockPrisma({ findUnique: jest.fn().mockResolvedValue(CLIENT_RECORD) });
    const repo = new PrismaClientRepository(prisma);
    const client = await repo.findByTaxId(TaxId.create('XYZ850101XXX'));

    expect(client).not.toBeNull();
    expect(client!.valueEmail).toBe('corp@sa.mx');
  });
});
