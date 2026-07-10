import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { ClientAlreadyExistsException } from '../exceptions/client.exceptions';

export interface RegisterClientCommand {
  id: string;
  rfc: string;
  name: string;
  email: string;
}

export class RegisterClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(command: RegisterClientCommand): Promise<void> {
    const taxId = TaxId.create(command.rfc);

    const existing = await this.clientRepository.findByTaxId(taxId);
    if (existing) {
      throw new ClientAlreadyExistsException(taxId.value);
    }

    const client = Client.create(command.id, taxId, command.name, command.email);
    await this.clientRepository.save(client);
  }
}
