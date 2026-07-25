import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification, NotificationType } from '../../domain/entities/notification.entity';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(notification: Notification): Promise<void> {
    await this.prisma.notificationRecord.upsert({
      where: { id: notification.valueId },
      create: {
        id: notification.valueId,
        userId: notification.valueUserId,
        title: notification.valueTitle,
        message: notification.valueMessage,
        type: notification.valueType,
        isRead: notification.valueIsRead,
        createdAt: notification.valueCreatedAt,
      },
      update: {
        isRead: notification.valueIsRead,
      },
    });
  }

  async findByUserId(userId?: string | null): Promise<Notification[]> {
    const records = await this.prisma.notificationRecord.findMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : { userId: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return records.map(
      (rec) =>
        new Notification({
          id: rec.id,
          userId: rec.userId,
          title: rec.title,
          message: rec.message,
          type: rec.type as NotificationType,
          isRead: rec.isRead,
          createdAt: rec.createdAt,
        }),
    );
  }

  async findById(id: string): Promise<Notification | null> {
    const rec = await this.prisma.notificationRecord.findUnique({
      where: { id },
    });

    if (!rec) return null;

    return new Notification({
      id: rec.id,
      userId: rec.userId,
      title: rec.title,
      message: rec.message,
      type: rec.type as NotificationType,
      isRead: rec.isRead,
      createdAt: rec.createdAt,
    });
  }

  async markAllAsRead(userId?: string | null): Promise<void> {
    await this.prisma.notificationRecord.updateMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : { userId: null },
      data: { isRead: true },
    });
  }
}
