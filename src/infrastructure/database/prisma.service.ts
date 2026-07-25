import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * SERVICIO DE CONEXIÓN BD (PrismaService)
 * Capa: Infraestructura / Datos (Database Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Heredar de `PrismaClient` para proveer la conexión directa con SQLite.
 * Se suscribe a los ganchos de ciclo de vida de NestJS para conectar y desconectar de forma segura la base de datos.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Conecta a la base de datos al arrancar la aplicación
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      console.log('✅ Prisma conectado exitosamente a la base de datos.');
    } catch (error) {
      console.error('❌ Error al conectar Prisma a la base de datos:', error);
    }
  }

  // Libera la conexión al apagarse el servidor
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
