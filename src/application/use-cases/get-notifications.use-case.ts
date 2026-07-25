import { NotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

export interface GetNotificationsQuery {
  userId?: string;
}

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(query?: GetNotificationsQuery): Promise<Notification[]> {
    return await this.notificationRepository.findByUserId(query?.userId);
  }
}
