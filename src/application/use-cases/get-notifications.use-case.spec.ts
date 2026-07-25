import { GetNotificationsUseCase } from './get-notifications.use-case';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationRepository } from '../../domain/repositories/notification.repository.interface';

describe('GetNotificationsUseCase', () => {
  let useCase: GetNotificationsUseCase;
  let mockNotificationRepository: jest.Mocked<NotificationRepository>;

  beforeEach(() => {
    mockNotificationRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      markAllAsRead: jest.fn(),
    };
    useCase = new GetNotificationsUseCase(mockNotificationRepository);
  });

  it('should return list of notifications from repository', async () => {
    const dummyNotification = new Notification({
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Nuevo cliente registrado',
      message: 'El cliente Empresa SA de CV fue registrado.',
      type: 'INFO',
    });

    mockNotificationRepository.findByUserId.mockResolvedValue([dummyNotification]);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(1);
    expect(result[0].valueTitle).toBe('Nuevo cliente registrado');
    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith('user-1');
  });
});
