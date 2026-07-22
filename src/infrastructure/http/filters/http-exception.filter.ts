import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../../domain/common/exceptions/domain.exception';
import { OperationValidationException } from '../../../domain/common/exceptions/operation-validation.exception';
import { ClientNotFoundException, ClientAlreadyExistsException } from '../../../application/exceptions/client.exceptions';

/**
 * FILTRO DE EXCEPCIONES HTTP
 * Capa: HTTP / Presentación (Http Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Es el "traductor de errores" global de la API. Captura cualquier excepción que sea arrojada
 * en las capas más internas (Dominio y Aplicación) y la traduce a una respuesta HTTP formal con su código 
 * de estado correspondiente (`404`, `409`, `422` o `500`) y estructura JSON unificada.
 * 
 * Defensa en entrevista:
 * "Este filtro nos permite tener excepciones puras de TypeScript en el dominio y la aplicación, 
 * sin ensuciarlas con códigos HTTP o dependencias del framework web. El filtro intercepta 
 * excepciones como ClientNotFoundException y decide responder un HTTP 404, o si es 
 * OperationValidationException responde un HTTP 422 agregando la lista detallada de errores por factura."
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Inicialización por defecto para errores imprevistos (500)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    // 1. Si es un error propio de NestJS (ej. validaciones de DTOs fallidas)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody: any = exception.getResponse();
      message = typeof resBody === 'string' ? resBody : resBody.message || exception.message;
    } 
    // 2. Si el cliente no existe (Error de Aplicación -> responde 404 Not Found)
    else if (exception instanceof ClientNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } 
    // 3. Si el RFC ya está registrado (Error de Aplicación -> responde 409 Conflict)
    else if (exception instanceof ClientAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } 
    // 4. Si fallaron reglas de negocio del lote de facturas (Error de Dominio -> responde 422 Unprocessable Entity)
    else if (exception instanceof OperationValidationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      errors = exception.errors; // Incluye la lista de facturas fallidas y sus razones
    } 
    // 5. Otros errores genéricos del Dominio (responde 422 Unprocessable Entity)
    else if (exception instanceof DomainException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
    } 
    // 6. Errores genéricos de JavaScript
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Retorna la respuesta HTTP formateada
    response.status(status).json({
      statusCode: status,
      message,
      ...(errors ? { errors } : {}), // Agrega el desglose de errores solo si existen
      timestamp: new Date().toISOString(),
    });
  }
}
