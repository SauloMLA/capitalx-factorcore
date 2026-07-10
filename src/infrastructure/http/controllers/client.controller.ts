import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { RegisterClientUseCase } from '../../../application/use-cases/register-client.use-case';
import { ApproveClientUseCase } from '../../../application/use-cases/approve-client.use-case';
import { RegisterClientDto } from '../dtos/register-client.dto';

@Controller('clientes')
export class ClientController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly approveClientUseCase: ApproveClientUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    await this.approveClientUseCase.execute({ clientId: id });
  }
}
