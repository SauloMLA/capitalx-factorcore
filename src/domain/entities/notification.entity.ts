import { DomainException } from '../common/exceptions/domain.exception';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';

export interface NotificationProps {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type?: NotificationType;
  isRead?: boolean;
  createdAt?: Date;
}

export class Notification {
  private readonly id: string;
  private readonly userId: string | null;
  private readonly title: string;
  private readonly message: string;
  private readonly type: NotificationType;
  private isRead: boolean;
  private readonly createdAt: Date;

  constructor(props: NotificationProps) {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainException('Notification ID cannot be empty');
    }
    if (!props.title || props.title.trim().length === 0) {
      throw new DomainException('Notification title cannot be empty');
    }
    if (!props.message || props.message.trim().length === 0) {
      throw new DomainException('Notification message cannot be empty');
    }

    this.id = props.id;
    this.userId = props.userId ?? null;
    this.title = props.title.trim();
    this.message = props.message.trim();
    this.type = props.type ?? 'INFO';
    this.isRead = props.isRead ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }

  public get valueId(): string {
    return this.id;
  }

  public get valueUserId(): string | null {
    return this.userId;
  }

  public get valueTitle(): string {
    return this.title;
  }

  public get valueMessage(): string {
    return this.message;
  }

  public get valueType(): NotificationType {
    return this.type;
  }

  public get valueIsRead(): boolean {
    return this.isRead;
  }

  public get valueCreatedAt(): Date {
    return this.createdAt;
  }

  public markAsRead(): void {
    this.isRead = true;
  }
}
