import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateOperationUseCase, OperationResult } from '../../../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase, ClientSummaryResult } from '../../../application/use-cases/get-client-summary.use-case';
import { CreateOperationDto } from '../dtos/create-operation.dto';
import { OperationResponseDto } from '../dtos/operation-response.dto';
import { ClientSummaryResponseDto } from '../dtos/client-summary-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Operaciones')
@Controller()
export class OperationController {
  constructor(
    private readonly createOperationUseCase: CreateOperationUseCase,
    private readonly getClientSummaryUseCase: GetClientSummaryUseCase,
  ) {}

  @Post('operaciones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and origin a factoring operation with invoices' })
  @ApiResponse({ status: 201, description: 'Operation created successfully', type: OperationResponseDto })
  @ApiResponse({ status: 400, description: 'Client not approved or client ID is missing' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable Entity: Business rules validation failure (eligibility, duplicate folios, negative amounts)' })
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
  @ApiOperation({ summary: 'Get executive summary and metrics for a client' })
  @ApiParam({ name: 'id', description: 'Client UUID v4', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Executive summary retrieved successfully', type: ClientSummaryResponseDto })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getSummary(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<ClientSummaryResult> {
    return await this.getClientSummaryUseCase.execute(id);
  }
}
