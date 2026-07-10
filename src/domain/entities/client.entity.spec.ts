import { Client } from './client.entity';
import { TaxId } from '../common/value-objects/tax-id.value-object';
import { ClientStatus } from '../enums/client-status.enum';
import { DomainException } from '../common/exceptions/domain.exception';

describe('Client Aggregate Root', () => {
  const mockId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTaxId = TaxId.create('XYZ850101XXX');
  const mockName = 'Consorcio Industrial S.A.';
  const mockEmail = 'contacto@consorcio.mx';

  it('should create a client with PENDING status by default', () => {
    const client = Client.create(mockId, mockTaxId, mockName, mockEmail);
    expect(client.valueId).toBe(mockId);
    expect(client.valueTaxId.value).toBe(mockTaxId.value);
    expect(client.valueName).toBe(mockName);
    expect(client.valueEmail).toBe(mockEmail.toLowerCase());
    expect(client.valueStatus).toBe(ClientStatus.PENDING);
    expect(client.isApproved()).toBe(false);
  });

  it('should throw DomainException if ID is empty', () => {
    expect(() => Client.create('', mockTaxId, mockName, mockEmail)).toThrow(DomainException);
  });

  it('should throw DomainException if name is empty', () => {
    expect(() => Client.create(mockId, mockTaxId, '', mockEmail)).toThrow(DomainException);
  });

  it('should throw DomainException if email is empty', () => {
    expect(() => Client.create(mockId, mockTaxId, mockName, '')).toThrow(DomainException);
  });

  it('should approve a pending client successfully', () => {
    const client = Client.create(mockId, mockTaxId, mockName, mockEmail);
    client.approve();
    expect(client.valueStatus).toBe(ClientStatus.APPROVED);
    expect(client.isApproved()).toBe(true);
  });

  it('should throw DomainException when approving an already approved client', () => {
    const client = Client.create(mockId, mockTaxId, mockName, mockEmail);
    client.approve();
    expect(() => client.approve()).toThrow(DomainException);
  });
});
