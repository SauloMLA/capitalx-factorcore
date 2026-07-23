import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure.module';
import { ClientController } from './controllers/client.controller';
import { OperationController } from './controllers/operation.controller';

/**
 * MÓDULO HTTP
 * Capa: HTTP / Presentación (Http Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Agrupar y registrar todos los controladores web (Controllers) que exponen la API al mundo exterior.
 * Al importar `InfrastructureModule`, tiene acceso directo a los Casos de Uso del sistema para
 * poder inyectarlos en los constructores de sus controladores.
 */
@Module({
  imports: [InfrastructureModule], // Permite el acceso a los Use Cases de negocio
  controllers: [ClientController, OperationController], // Registra las rutas de Clientes y Operaciones
})
export class HttpModule {}
