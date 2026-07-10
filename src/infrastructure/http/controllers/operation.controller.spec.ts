import { Test, TestingModule } from '@nestjs/testing';
import { OperationController } from './operation.controller';
import { CreateOperationUseCase } from '../../../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase } from '../../../application/use-cases/get-client-summary.use-case';

describe('OperationController', () => {
  let controller: OperationController;
  let createUseCase: CreateOperationUseCase;
  let summaryUseCase: GetClientSummaryUseCase;

  beforeEach(async () => {
    const mockCreate = { execute: jest.fn() };
    const mockSummary = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperationController],
      providers: [
        { provide: CreateOperationUseCase, useValue: mockCreate },
        { provide: GetClientSummaryUseCase, useValue: mockSummary },
      ],
    }).compile();

    controller = module.get<OperationController>(OperationController);
    createUseCase = module.get<CreateOperationUseCase>(CreateOperationUseCase);
    summaryUseCase = module.get<GetClientSummaryUseCase>(GetClientSummaryUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create operation use case with payload', async () => {
    const payload = {
      operationId: 'op-uuid',
      clientId: 'client-uuid',
      requestDate: new Date('2026-07-10T12:00:00Z'),
      invoices: [],
    };
    await controller.create(payload);
    expect(createUseCase.execute).toHaveBeenCalledWith(payload);
  });

  it('should call get client summary use case with client ID', async () => {
    const clientId = 'client-uuid';
    await controller.getSummary(clientId);
    expect(summaryUseCase.execute).toHaveBeenCalledWith(clientId);
  });
});
