import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { RegisterClientUseCase } from '../../../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../../../application/use-cases/approve-client.use-case';

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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        { provide: RegisterClientUseCase, useValue: mockRegisterUseCase },
        { provide: ApproveClientUseCase, useValue: mockApproveUseCase },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    registerUseCase = module.get(RegisterClientUseCase);
    approveUseCase = module.get(ApproveClientUseCase);
  });

  it('should call register client use case with command', async () => {
    const payload = {
      rfc: 'XYZ850101XXX',
      name: 'Test Name',
      email: 'test@email.com',
    };
    await controller.register(payload, { user: { id: 'test-user-1' }, headers: {}, ip: '127.0.0.1' } as any);
    expect(registerUseCase.execute).toHaveBeenCalledWith({
      ...payload,
      performedBy: 'test-user-1',
      ip: '127.0.0.1',
      userAgent: undefined,
    });
  });

  it('should call approve client use case with client ID', async () => {
    await controller.approve('some-id', { user: { id: 'test-user-1' }, headers: {}, ip: '127.0.0.1' } as any);
    expect(approveUseCase.execute).toHaveBeenCalledWith({ 
      clientId: 'some-id',
      performedBy: 'test-user-1',
      ip: '127.0.0.1',
      userAgent: undefined,
    });
  });
});
