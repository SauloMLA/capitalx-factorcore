import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Obtener lista de todos los usuarios (Solo Administradores)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para realizar esta acción.' })
  async findAll() {
    return this.getUsersUseCase.execute();
  }
}
