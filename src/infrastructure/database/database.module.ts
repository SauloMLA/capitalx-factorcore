import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * MÓDULO DE BASE DE DATOS
 * Capa: Infraestructura (Infrastructure Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Agrupar y exportar el servicio de conexión a la base de datos `PrismaService`.
 * Al estar decorado con `@Global()`, le dice a NestJS que este módulo se registra globalmente, 
 * por lo que cualquier otro módulo de la aplicación puede inyectar `PrismaService` directamente
 * sin necesidad de importar `DatabaseModule` una y otra vez en cada archivo de módulo.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exportado para que esté disponible para todo el sistema
})
export class DatabaseModule {}
