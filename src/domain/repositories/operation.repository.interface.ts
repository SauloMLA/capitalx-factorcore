import { Operation } from '../entities/operation.entity';

export interface OperationRepository {
  save(operation: Operation): Promise<void>;
  findById(id: string): Promise<Operation | null>;
  findFoliosByClientId(clientId: string): Promise<string[]>;
  findByClientId(clientId: string): Promise<Operation[]>;
}
