import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateOperationUseCase, OperationResult } from '../../../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase, ClientSummaryResult } from '../../../application/use-cases/get-client-summary.use-case';
import { CreateOperationDto } from '../dtos/create-operation.dto';

@Controller()
export class OperationController {
  constructor(
    private readonly createOperationUseCase: CreateOperationUseCase,
    private readonly getClientSummaryUseCase: GetClientSummaryUseCase,
  ) {}

  @Post('operaciones')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOperationDto): Promise<OperationResult> {
    return await this.createOperationUseCase.execute({
      operationId: dto.operationId,
      clientId: dto.clientId,
      requestDate: dto.requestDate,
      invoices: dto.invoices,
    });
  }

  @Get('clientes/:id/resumen')
  @HttpCode(HttpStatus.OK)
  async getSummary(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<ClientSummaryResult> {
    return await this.getClientSummaryUseCase.execute(id);
  }
}
