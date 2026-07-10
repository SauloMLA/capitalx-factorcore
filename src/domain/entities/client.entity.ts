import { TaxId } from '../common/value-objects/tax-id.value-object';
import { ClientStatus } from '../enums/client-status.enum';
import { DomainException } from '../common/exceptions/domain.exception';

export class Client {
  private readonly id: string;
  private readonly taxId: TaxId;
  private readonly name: string;
  private status: ClientStatus;

  private constructor(id: string, taxId: TaxId, name: string, status: ClientStatus) {
    this.id = id;
    this.taxId = taxId;
    this.name = name;
    this.status = status;
  }

  public static create(id: string, taxId: TaxId, name: string, status: ClientStatus = ClientStatus.ACTIVE): Client {
    if (!id || id.trim().length === 0) {
      throw new DomainException('Client ID cannot be empty');
    }
    if (!name || name.trim().length === 0) {
      throw new DomainException('Client name cannot be empty');
    }
    return new Client(id, taxId, name.trim(), status);
  }

  public get valueId(): string {
    return this.id;
  }

  public get valueTaxId(): TaxId {
    return this.taxId;
  }

  public get valueName(): string {
    return this.name;
  }

  public get valueStatus(): ClientStatus {
    return this.status;
  }

  public isActive(): boolean {
    return this.status === ClientStatus.ACTIVE;
  }

  public deactivate(): void {
    if (this.status === ClientStatus.INACTIVE) {
      throw new DomainException('Client is already inactive');
    }
    this.status = ClientStatus.INACTIVE;
  }

  public activate(): void {
    if (this.status === ClientStatus.ACTIVE) {
      throw new DomainException('Client is already active');
    }
    this.status = ClientStatus.ACTIVE;
  }
}
