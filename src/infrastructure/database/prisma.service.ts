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
  // Conecta físicamente a la base de datos SQLite al arrancar la aplicación
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  // Libera la conexión con la base de datos al apagarse el servidor para evitar fugas de memoria
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
