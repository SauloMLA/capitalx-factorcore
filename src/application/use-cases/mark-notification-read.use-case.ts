import { NotificationRepository } from '../../domain/repositories/notification.repository.interface';

export interface MarkNotificationReadCommand {
  notificationId?: string;
  userId?: string;
  markAll?: boolean;
}

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(command: MarkNotificationReadCommand): Promise<void> {
    if (command.markAll) {
      await this.notificationRepository.markAllAsRead(command.userId);
      return;
    }

    if (!command.notificationId) return;

    const notification = await this.notificationRepository.findById(command.notificationId);
    if (notification) {
      notification.markAsRead();
      await this.notificationRepository.save(notification);
    }
  }
}
