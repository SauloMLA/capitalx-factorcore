import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './infrastructure/http/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

/**
 * ARCHIVO DE INICIO (Bootstrap)
 * Capa: Infraestructura / Entrada (Entry Point)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Registrar cookie-parser para el manejo seguro de Refresh Tokens en cookies HttpOnly
  app.use(cookieParser());

  // Configuración de CORS segura para permitir peticiones desde Vercel / Localhost con credentials
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        (frontendUrl && origin === frontendUrl) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

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

  const port = process.env.PORT ? Number(process.env.PORT) : 3005;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on port ${port}`);
}
bootstrap();
