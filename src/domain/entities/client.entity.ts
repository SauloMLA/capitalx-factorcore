import { TaxId } from '../common/value-objects/tax-id.value-object';
import { ClientStatus } from '../enums/client-status.enum';
import { DomainException } from '../common/exceptions/domain.exception';

export class Client {
  private readonly id: string;
  private readonly taxId: TaxId;
  private readonly name: string;
  private readonly email: string;
  private status: ClientStatus;

  private constructor(id: string, taxId: TaxId, name: string, email: string, status: ClientStatus) {
    this.id = id;
    this.taxId = taxId;
    this.name = name;
    this.email = email;
    this.status = status;
  }

  public static create(id: string, taxId: TaxId, name: string, email: string): Client {
    if (!id || id.trim().length === 0) {
      throw new DomainException('Client ID cannot be empty');
    }
    if (!name || name.trim().length === 0) {
      throw new DomainException('Client name cannot be empty');
    }
    if (!email || email.trim().length === 0) {
      throw new DomainException('Client email cannot be empty');
    }
    // All clients start as PENDING per business rules
    return new Client(id, taxId, name.trim(), email.trim().toLowerCase(), ClientStatus.PENDING);
  }

  /**
   * Reconstructs a Client from persisted data.
   * Used exclusively by the persistence Mapper — bypasses the PENDING-only invariant
   * so any previously saved status can be faithfully restored.
   */
  public static reconstitute(
    id: string,
    taxId: TaxId,
    name: string,
    email: string,
    status: ClientStatus,
  ): Client {
    return new Client(id, taxId, name, email, status);
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

  public get valueEmail(): string {
    return this.email;
  }

  public get valueStatus(): ClientStatus {
    return this.status;
  }

  public isApproved(): boolean {
    return this.status === ClientStatus.APPROVED;
  }

  public approve(): void {
    if (this.status === ClientStatus.APPROVED) {
      throw new DomainException('Client is already approved');
    }
    this.status = ClientStatus.APPROVED;
  }
}
