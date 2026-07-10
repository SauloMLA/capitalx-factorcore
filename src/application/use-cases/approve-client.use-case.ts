import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { ClientNotFoundException } from '../exceptions/client.exceptions';

export interface ApproveClientCommand {
  clientId: string;
}

export class ApproveClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(command: ApproveClientCommand): Promise<void> {
    const client = await this.clientRepository.findById(command.clientId);
    if (!client) {
      throw new ClientNotFoundException(command.clientId);
    }

    // Domain guards the state transition: throws if already APPROVED
    client.approve();
    await this.clientRepository.save(client);
  }
}
