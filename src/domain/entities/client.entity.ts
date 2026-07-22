import { TaxId } from '../common/value-objects/tax-id.value-object';
import { ClientStatus } from '../enums/client-status.enum';
import { DomainException } from '../common/exceptions/domain.exception';

/**
 * ENTIDAD: Cliente (Client)
 * Capa: Dominio (Domain Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Representar una empresa proveedora registrada en la plataforma de factoraje.
 * Guarda su RFC, razón social, correo de contacto y estado.
 * Se encarga de proteger sus propias reglas de cambio de estado (ej. de PENDING a APPROVED).
 * 
 * Defensa en entrevista:
 * "Client es una Entidad porque posee una identidad única (ID) que persiste a lo largo del tiempo.
 * Protege sus invariantes al nacer (siempre en PENDING) y al aprobarse (lanza error si ya estaba aprobado)."
 */
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

  // Fábrica estática para el registro inicial de un nuevo cliente (siempre nace en PENDING)
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
    // Todos los clientes inician PENDING obligatoriamente por regla de negocio
    return new Client(id, taxId, name.trim(), email.trim().toLowerCase(), ClientStatus.PENDING);
  }

  /**
   * RECONSTITUCIÓN: Restaura un cliente existente desde la persistencia (Base de Datos).
   * Evita las reglas de creación inicial, permitiendo restaurar el estado tal cual está en la base de datos (ej. APPROVED).
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

  // Transiciona el estado a APPROVED. Valida que no se intente aprobar un cliente ya aprobado
  public approve(): void {
    if (this.status === ClientStatus.APPROVED) {
      throw new DomainException('Client is already approved');
    }
    this.status = ClientStatus.APPROVED;
  }
}
