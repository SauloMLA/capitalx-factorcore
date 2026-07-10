import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { RegisterClientUseCase } from '../../../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../../../application/use-cases/approve-client.use-case';
import { RegisterClientDto } from '../dtos/register-client.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly approveClientUseCase: ApproveClientUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new client in pending status' })
  @ApiResponse({ status: 201, description: 'Client registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload or RFC format validation error' })
  @ApiResponse({ status: 409, description: 'Conflict: A client with this RFC already exists' })
  async register(@Body() dto: RegisterClientDto): Promise<void> {
    await this.registerClientUseCase.execute({
      id: dto.id,
      rfc: dto.rfc,
      name: dto.name,
      email: dto.email,
    });
  }

  @Patch(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending client to allow factoring operations' })
  @ApiParam({ name: 'id', description: 'Client UUID v4', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Client approved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 422, description: 'Unprocessable Entity: Client is already approved' })
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    await this.approveClientUseCase.execute({ clientId: id });
  }
}
