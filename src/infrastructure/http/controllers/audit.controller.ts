import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetAuditLogsUseCase } from '../../../application/use-cases/get-audit-logs.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Obtener bitácora de auditoría (Solo Administradores)' })
  @ApiResponse({ status: 200, description: 'Lista de registros de auditoría obtenida exitosamente.' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para realizar esta acción.' })
  @ApiQuery({ name: 'entity', required: false, description: 'Filtrar por entidad (ej. Client, User, Operation)' })
  @ApiQuery({ name: 'action', required: false, description: 'Filtrar por acción (ej. CREATE, APPROVE)' })
  @ApiQuery({ name: 'performedBy', required: false, description: 'Filtrar por ID del usuario' })
  async findAll(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('performedBy') performedBy?: string,
  ) {
    const logs = await this.getAuditLogsUseCase.execute({ entity, action, performedBy });
    return logs.map((log) => ({
      id: log.id,
      entity: log.entity,
      entityId: log.entityId,
      action: log.action,
      performedBy: log.performedBy,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null,
      ip: log.ip,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
    }));
  }
}
