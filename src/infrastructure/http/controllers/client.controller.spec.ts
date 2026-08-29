import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { RegisterClientUseCase } from '../../../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../../../application/use-cases/approve-client.use-case';
import { GetClientListUseCase } from '../../../application/use-cases/get-client-list.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';

describe('ClientController', () => {
  let controller: ClientController;
  let registerUseCase: jest.Mocked<RegisterClientUseCase>;
  let approveUseCase: jest.Mocked<ApproveClientUseCase>;

  beforeEach(async () => {
    const mockRegisterUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 'some-id' }),
    };

    const mockApproveUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const mockGetClientListUseCase = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        { provide: RegisterClientUseCase, useValue: mockRegisterUseCase },
        { provide: ApproveClientUseCase, useValue: mockApproveUseCase },
        { provide: GetClientListUseCase, useValue: mockGetClientListUseCase },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    registerUseCase = module.get(RegisterClientUseCase);
    approveUseCase = module.get(ApproveClientUseCase);
  });

  it('should have @Roles(UserRole.ADMINISTRATOR) metadata on approve method', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, controller.approve);
    expect(roles).toEqual([UserRole.ADMINISTRATOR]);
  });

  it('should call register client use case with command and user sub from JWT', async () => {
    const payload = {
      rfc: 'XYZ850101XXX',
      name: 'Test Name',
      email: 'test@email.com',
    };
    await controller.register(payload, { user: { sub: 'test-user-1' }, headers: {}, ip: '127.0.0.1' } as any);
    expect(registerUseCase.execute).toHaveBeenCalledWith({
      ...payload,
      performedBy: 'test-user-1',
      ip: '127.0.0.1',
      userAgent: undefined,
    });
  });

  it('should fallback performedBy to system when user is not present in request', async () => {
    const payload = {
      rfc: 'XYZ850101XXX',
      name: 'Test Name',
      email: 'test@email.com',
    };
    await controller.register(payload, { headers: {}, ip: '127.0.0.1' } as any);
    expect(registerUseCase.execute).toHaveBeenCalledWith({
      ...payload,
      performedBy: 'system',
      ip: '127.0.0.1',
      userAgent: undefined,
    });
  });

  it('should call approve client use case with client ID and user sub from JWT', async () => {
    await controller.approve('some-id', { user: { sub: 'test-user-1' }, headers: {}, ip: '127.0.0.1' } as any);
    expect(approveUseCase.execute).toHaveBeenCalledWith({ 
      clientId: 'some-id',
      performedBy: 'test-user-1',
      ip: '127.0.0.1',
      userAgent: undefined,
    });
  });
});
