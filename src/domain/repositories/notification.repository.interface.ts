import { Notification } from '../entities/notification.entity';

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findByUserId(userId?: string | null): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  markAllAsRead(userId?: string | null): Promise<void>;
}
