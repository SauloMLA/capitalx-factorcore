import { ClientMapper } from './client.mapper';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientStatus } from '../../domain/enums/client-status.enum';
import { DomainException } from '../../domain/common/exceptions/domain.exception';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pendingRecord() {
  return {
    id: 'uuid-1',
    rfc: 'XYZ850101XXX',
    name: 'Corp S.A.',
    email: 'corp@sa.mx',
    status: 'PENDING',
    createdAt: new Date('2026-07-01T00:00:00Z'),
    updatedAt: new Date('2026-07-01T00:00:00Z'),
  };
}

function approvedRecord() {
  return { ...pendingRecord(), status: 'APPROVED' };
}

// ─── toDomain ────────────────────────────────────────────────────────────────

describe('ClientMapper.toDomain', () => {
  it('should reconstruct a PENDING client from a persistence record', () => {
    const client = ClientMapper.toDomain(pendingRecord());
    expect(client.valueId).toBe('uuid-1');
    expect(client.valueTaxId.value).toBe('XYZ850101XXX');
    expect(client.valueName).toBe('Corp S.A.');
    expect(client.valueEmail).toBe('corp@sa.mx');
    expect(client.valueStatus).toBe(ClientStatus.PENDING);
    expect(client.isApproved()).toBe(false);
  });

  it('should reconstruct an APPROVED client from a persistence record', () => {
    const client = ClientMapper.toDomain(approvedRecord());
    expect(client.valueStatus).toBe(ClientStatus.APPROVED);
    expect(client.isApproved()).toBe(true);
  });

  it('should throw DomainException for an unknown status value', () => {
    const corruptRecord = { ...pendingRecord(), status: 'SUSPENDED' };
    expect(() => ClientMapper.toDomain(corruptRecord)).toThrow(DomainException);
  });
});

// ─── toPersistence ───────────────────────────────────────────────────────────

describe('ClientMapper.toPersistence', () => {
  it('should convert a domain Client to a flat persistence object', () => {
    const client = Client.reconstitute(
      'uuid-1',
      TaxId.create('XYZ850101XXX'),
      'Corp S.A.',
      'corp@sa.mx',
      ClientStatus.APPROVED,
    );

    const record = ClientMapper.toPersistence(client);
    expect(record.id).toBe('uuid-1');
    expect(record.rfc).toBe('XYZ850101XXX');
    expect(record.name).toBe('Corp S.A.');
    expect(record.email).toBe('corp@sa.mx');
    expect(record.status).toBe('APPROVED');
  });

  it('should produce a round-trip identical record', () => {
    const original = pendingRecord();
    const client = ClientMapper.toDomain(original);
    const persisted = ClientMapper.toPersistence(client);

    expect(persisted.id).toBe(original.id);
    expect(persisted.rfc).toBe(original.rfc);
    expect(persisted.status).toBe(original.status);
  });
});
