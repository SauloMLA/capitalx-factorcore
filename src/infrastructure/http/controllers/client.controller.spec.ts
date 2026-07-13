import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { RegisterClientUseCase } from '../../../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../../../application/use-cases/approve-client.use-case';

describe('ClientController', () => {
  let controller: ClientController;
  let registerUseCase: RegisterClientUseCase;
  let approveUseCase: ApproveClientUseCase;

  beforeEach(async () => {
    const mockRegister = { execute: jest.fn() };
    const mockApprove = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        { provide: RegisterClientUseCase, useValue: mockRegister },
        { provide: ApproveClientUseCase, useValue: mockApprove },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    registerUseCase = module.get<RegisterClientUseCase>(RegisterClientUseCase);
    approveUseCase = module.get<ApproveClientUseCase>(ApproveClientUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register client use case with command', async () => {
    const payload = {
      rfc: 'XYZ850101XXX',
      name: 'Test Name',
      email: 'test@email.com',
    };
    await controller.register(payload);
    expect(registerUseCase.execute).toHaveBeenCalledWith(payload);
  });

  it('should call approve client use case with client ID', async () => {
    const id = 'uuid-2';
    await controller.approve(id);
    expect(approveUseCase.execute).toHaveBeenCalledWith({ clientId: id });
  });
});
