import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './infrastructure/http/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * ARCHIVO DE INICIO (Bootstrap)
 * Capa: Infraestructura / Entrada (Entry Point)
 * 
 * ¿Qué responsabilidad tiene?
 * Es el punto de arranque de toda la aplicación NestJS. 
 * Configura los middlewares globales (validación de datos, filtro de errores) y la documentación de Swagger.
 */
async function bootstrap() {
  // 1. Crea la instancia del servidor NestJS usando el módulo raíz AppModule
  const app = await NestFactory.create(AppModule);

  // 2. Registra un validador global para los DTOs de entrada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Elimina del payload cualquier campo que no esté definido en el DTO
      forbidNonWhitelisted: true, // Lanza un error 400 Bad Request si envían campos no permitidos
      transform: true,          // Convierte automáticamente los payloads a instancias del DTO
    }),
  );

  // 3. Registra el filtro de excepciones global para formatear cualquier error interno a JSON RESTful
  app.useGlobalFilters(new HttpExceptionFilter());

  // 4. Configura e inicializa la documentación interactiva de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Factoraje Capital X')
    .setDescription('API con Clean Architecture para registro de clientes y originación de operaciones financieras.')
    .setVersion('1.0.0')
    .addTag('Clientes', 'Operaciones de clientes (registro, aprobación y resumen ejecutivo)')
    .addTag('Operaciones', 'Originación de operaciones de factoraje y validación de facturas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 5. Enciende el servidor en el puerto 3000 o el provisto por el entorno
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();



