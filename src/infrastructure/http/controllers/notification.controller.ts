import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetNotificationsUseCase } from '../../../application/use-cases/get-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../../application/use-cases/mark-notification-read.use-case';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario/sistema' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones obtenida exitosamente.' })
  async findAll(@Req() req: any) {
    const userId = req.user?.id;
    const notifications = await this.getNotificationsUseCase.execute({ userId });
    return notifications.map((n) => ({
      id: n.valueId,
      userId: n.valueUserId,
      title: n.valueTitle,
      message: n.valueMessage,
      type: n.valueType,
      isRead: n.valueIsRead,
      createdAt: n.valueCreatedAt,
    }));
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas como leídas.' })
  async markAllRead(@Req() req: any) {
    const userId = req.user?.id;
    await this.markNotificationReadUseCase.execute({ userId, markAll: true });
    return { success: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación específica como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída.' })
  async markAsRead(@Param('id') id: string) {
    await this.markNotificationReadUseCase.execute({ notificationId: id });
    return { success: true };
  }
}
