import { Test, TestingModule } from '@nestjs/testing';
import { OperationController } from './operation.controller';
import { CreateOperationUseCase } from '../../../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../../../application/use-cases/get-client-summary.use-case';
import { GetOperationListUseCase } from '../../../application/use-cases/get-operation-list.use-case';

describe('OperationController', () => {
  let controller: OperationController;
  let createUseCase: jest.Mocked<CreateOperationUseCase>;

  beforeEach(async () => {
    const mockCreateUseCase = {
      execute: jest.fn().mockResolvedValue({ operationId: 'op-123', totalAmount: 100 }),
    };
    const mockGetSummaryUseCase = {
      execute: jest.fn(),
    };
    const mockGetOperationListUseCase = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationController],
      providers: [
        { provide: CreateOperationUseCase, useValue: mockCreateUseCase },
        { provide: GetClientSummaryUseCase, useValue: mockGetSummaryUseCase },
        { provide: GetOperationListUseCase, useValue: mockGetOperationListUseCase },
      ],
    }).compile();

    controller = module.get<OperationController>(OperationController);
    createUseCase = module.get(CreateOperationUseCase);
  });

  it('should call create operation use case with payload', async () => {
    const payload = {
      clientId: 'client-1',
      requestDate: new Date(),
      invoices: [],
    };
    await controller.create(payload, { user: { id: 'test-user-1' }, headers: {}, ip: '127.0.0.1' } as any);
    expect(createUseCase.execute).toHaveBeenCalledWith({
      ...payload,
      performedBy: 'test-user-1',
      ip: '127.0.0.1',
      userAgent: undefined,
    });
  });
});
