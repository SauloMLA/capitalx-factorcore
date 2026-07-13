import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './infrastructure/http/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('API de Factoraje Capital X')
    .setDescription('API con Clean Architecture para registro de clientes y originación de operaciones financieras.')
    .setVersion('1.0.0')
    .addTag('Clientes', 'Operaciones de clientes (registro, aprobación y resumen ejecutivo)')
    .addTag('Operaciones', 'Originación de operaciones de factoraje y validación de facturas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();



