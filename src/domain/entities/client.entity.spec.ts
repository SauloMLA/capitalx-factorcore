import { Client } from './client.entity';
import { TaxId } from '../common/value-objects/tax-id.value-object';
import { ClientStatus } from '../enums/client-status.enum';
import { DomainException } from '../common/exceptions/domain.exception';

describe('Client Aggregate Root', () => {
  const mockId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTaxId = TaxId.create('XYZ850101XXX');
  const mockName = 'Consorcio Industrial S.A.';

  it('should create a valid active client by default', () => {
    const client = Client.create(mockId, mockTaxId, mockName);
    expect(client.valueId).toBe(mockId);
    expect(client.valueTaxId.value).toBe(mockTaxId.value);
    expect(client.valueName).toBe(mockName);
    expect(client.valueStatus).toBe(ClientStatus.ACTIVE);
    expect(client.isActive()).toBe(true);
  });

  it('should throw DomainException if ID is empty', () => {
    expect(() => Client.create('', mockTaxId, mockName)).toThrow(DomainException);
  });

  it('should throw DomainException if Name is empty', () => {
    expect(() => Client.create(mockId, mockTaxId, '')).toThrow(DomainException);
  });

  it('should deactivate active client successfully', () => {
    const client = Client.create(mockId, mockTaxId, mockName);
    client.deactivate();
    expect(client.valueStatus).toBe(ClientStatus.INACTIVE);
    expect(client.isActive()).toBe(false);
  });

  it('should throw DomainException if deactivating an already inactive client', () => {
    const client = Client.create(mockId, mockTaxId, mockName, ClientStatus.INACTIVE);
    expect(() => client.deactivate()).toThrow(DomainException);
  });

  it('should activate inactive client successfully', () => {
    const client = Client.create(mockId, mockTaxId, mockName, ClientStatus.INACTIVE);
    client.activate();
    expect(client.valueStatus).toBe(ClientStatus.ACTIVE);
    expect(client.isActive()).toBe(true);
  });

  it('should throw DomainException if activating an already active client', () => {
    const client = Client.create(mockId, mockTaxId, mockName);
    expect(() => client.activate()).toThrow(DomainException);
  });
});
