import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateOperationUseCase, OperationResult } from '../../../application/use-cases/create-operation.use-case';
import { GetClientSummaryUseCase, ClientSummaryResult } from '../../../application/use-cases/get-client-summary.use-case';
import { CreateOperationDto } from '../dtos/create-operation.dto';
import { OperationResponseDto } from '../dtos/operation-response.dto';
import { ClientSummaryResponseDto } from '../dtos/client-summary-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

/**
 * CONTROLADOR DE OPERACIONES
 * Capa: HTTP / Entrega (Delivery Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Exponer los endpoints REST para originar operaciones de factoraje y obtener resúmenes de clientes.
 * Mapea los DTOs de entrada y salida de red, y delega los flujos a la capa de Aplicación.
 */
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Operaciones')
@Controller()
export class OperationController {
  constructor(
    private readonly createOperationUseCase: CreateOperationUseCase,
    private readonly getClientSummaryUseCase: GetClientSummaryUseCase,
  ) {}

  // POST /operaciones: Fondea y origina un lote de facturas
  @Post('operaciones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Origina una nueva operación de factoraje. Valida todas las reglas de negocio (elegibilidad, folios duplicados, montos positivos, cliente aprobado).' })
  @ApiResponse({ status: 201, description: 'Operación creada exitosamente', type: OperationResponseDto })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request: El payload enviado es inválido o faltan datos requeridos en el lote de facturas.',
    schema: { example: { message: ['invoices.0.amount must be a positive number'], error: 'Bad Request', statusCode: 400 } }
  })
  @ApiResponse({ status: 404, description: 'Not Found: Cliente no encontrado' })
  @ApiResponse({ 
    status: 422, 
    description: 'Unprocessable Entity: Fallo en validación de reglas de negocio (cliente PENDING, facturas fuera de rango 15-120 días, o folios duplicados).',
    schema: { example: { message: 'Operation validation failed: Invoice FAC-001 must have a remaining term strictly between 15 and 120 days.', error: 'Unprocessable Entity', statusCode: 422 } }
  })
  async create(@Body() dto: CreateOperationDto, @Req() req: any): Promise<OperationResult> {
    return await this.createOperationUseCase.execute({
      clientId: dto.clientId,
      requestDate: dto.requestDate,
      invoices: dto.invoices,
      performedBy: req.user?.id || 'system',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  // GET /clientes/:id/resumen: Resumen ejecutivo histórico del cliente
  @Get('clientes/:id/resumen')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtiene un resumen ejecutivo del cliente, incluyendo total de operaciones fondeadas, monto adelantado y la fecha del próximo vencimiento.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del Cliente', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Resumen ejecutivo obtenido exitosamente', type: ClientSummaryResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async getSummary(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<ClientSummaryResult> {
    return await this.getClientSummaryUseCase.execute(id);
  }
}
