export interface AuditLogProps {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  performedBy: string;
  oldValue?: string | null;
  newValue?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  timestamp?: Date;
}

/**
 * ENTIDAD: AuditLog
 * Capa: Dominio (Domain Layer)
 */
export class AuditLog {
  private readonly _id: string;
  private readonly _entity: string;
  private readonly _entityId: string;
  private readonly _action: string;
  private readonly _performedBy: string;
  private readonly _oldValue: string | null;
  private readonly _newValue: string | null;
  private readonly _ip: string | null;
  private readonly _userAgent: string | null;
  private readonly _timestamp: Date;

  constructor(props: AuditLogProps) {
    this._id = props.id;
    this._entity = props.entity;
    this._entityId = props.entityId;
    this._action = props.action;
    this._performedBy = props.performedBy;
    this._oldValue = props.oldValue || null;
    this._newValue = props.newValue || null;
    this._ip = props.ip || null;
    this._userAgent = props.userAgent || null;
    this._timestamp = props.timestamp || new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get entity(): string {
    return this._entity;
  }
  get entityId(): string {
    return this._entityId;
  }
  get action(): string {
    return this._action;
  }
  get performedBy(): string {
    return this._performedBy;
  }
  get oldValue(): string | null {
    return this._oldValue;
  }
  get newValue(): string | null {
    return this._newValue;
  }
  get ip(): string | null {
    return this._ip;
  }
  get userAgent(): string | null {
    return this._userAgent;
  }
  get timestamp(): Date {
    return this._timestamp;
  }
}
