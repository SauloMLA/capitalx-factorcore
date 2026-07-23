import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HttpModule } from './infrastructure/http/http.module';

/**
 * MÓDULO RAÍZ (AppModule)
 * Capa: Infraestructura / Configuración (Composition Root)
 * 
 * ¿Qué responsabilidad tiene?
 * Servir como el contenedor principal del sistema. 
 * Importa y compone los submódulos de la base de datos (DatabaseModule) y de la API REST (HttpModule).
 */
@Module({
  imports: [DatabaseModule, HttpModule],
})
export class AppModule {}
