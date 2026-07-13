import { randomUUID } from 'crypto';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { ClientAlreadyExistsException } from '../exceptions/client.exceptions';

export interface RegisterClientCommand {
  rfc: string;
  name: string;
  email: string;
}

export class RegisterClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(command: RegisterClientCommand): Promise<{ id: string }> {
    const taxId = TaxId.create(command.rfc);

    const existing = await this.clientRepository.findByTaxId(taxId);
    if (existing) {
      throw new ClientAlreadyExistsException(taxId.value);
    }

    const clientId = randomUUID();
    const client = Client.create(clientId, taxId, command.name, command.email);
    await this.clientRepository.save(client);

    return { id: clientId };
  }
}
