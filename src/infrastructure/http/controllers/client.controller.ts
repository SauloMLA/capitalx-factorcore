import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { RegisterClientUseCase } from '../../../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../../../application/use-cases/approve-client.use-case';
import { RegisterClientDto } from '../dtos/register-client.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

/**
 * CONTROLADOR DE CLIENTES
 * Capa: HTTP / Entrega (Delivery Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Exponer los endpoints REST de red para la gestión de clientes (registro y aprobación).
 * Recibe peticiones HTTP, extrae parámetros de ruta y payloads, e invoca los casos de uso.
 * 
 * Defensa en entrevista:
 * "Este controlador delega toda la lógica de negocio a los Use Cases correspondientes.
 * Su única tarea es de red: mapear peticiones y documentar la API usando Swagger. 
 * Aplicamos validaciones sintácticas estrictas como ParseUUIDPipe para asegurar que el ID 
 * en la ruta sea un UUID v4 válido antes de llamar al caso de uso."
 */
@ApiTags('Clientes')
@Controller('clientes')
export class ClientController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly approveClientUseCase: ApproveClientUseCase,
  ) {}

  // POST /clientes: Registro inicial del cliente
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra un nuevo cliente en estado PENDING. Los clientes deben ser aprobados antes de poder originar operaciones de factoraje.' })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request: El payload enviado es inválido o el formato del RFC es incorrecto.',
    schema: { example: { message: ['RFC must be a valid 12-character Mexican moral person RFC'], error: 'Bad Request', statusCode: 400 } }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict: Ya existe un cliente registrado con el RFC proporcionado.',
    schema: { example: { message: 'Client with TaxId CAP220101XYZ already exists', error: 'Conflict', statusCode: 409 } }
  })
  async register(@Body() dto: RegisterClientDto): Promise<{ id: string }> {
    return await this.registerClientUseCase.execute({
      rfc: dto.rfc,
      name: dto.name,
      email: dto.email,
    });
  }

  // PATCH /clientes/:id/aprobar: Aprobación explícita del cliente
  @Patch(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprueba a un cliente pendiente. Este es un prerrequisito para que el cliente pueda originar operaciones de factoraje.' })
  @ApiParam({ name: 'id', description: 'UUID v4 del Cliente', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Cliente aprobado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiResponse({ 
    status: 422, 
    description: 'Unprocessable Entity: El cliente ya se encuentra aprobado y no requiere otra aprobación.',
    schema: { example: { message: 'Client is already approved', error: 'Unprocessable Entity', statusCode: 422 } }
  })
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    await this.approveClientUseCase.execute({ clientId: id });
  }
}
