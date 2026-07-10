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

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody: any = exception.getResponse();
      message = typeof resBody === 'string' ? resBody : resBody.message || exception.message;
    } else if (exception instanceof ClientNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof ClientAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof OperationValidationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
      errors = exception.errors;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
