import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './infrastructure/http/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

/**
 * ARCHIVO DE INICIO (Bootstrap)
 * Capa: Infraestructura / Entrada (Entry Point)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Registrar cookie-parser para el manejo seguro de Refresh Tokens en cookies HttpOnly
  app.use(cookieParser());

  // Registra un validador global para los DTOs de entrada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Registra el filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configura e inicializa la documentación interactiva de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Factoraje Capital X')
    .setDescription('API con Clean Architecture para la plataforma SaaS de factoraje financiero.')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y administración de sesiones JWT')
    .addTag('Clientes', 'Operaciones de clientes (registro, aprobación y resumen ejecutivo)')
    .addTag('Operaciones', 'Originación de operaciones de factoraje y validación de facturas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
