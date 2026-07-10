import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { DomainException } from '../../../domain/common/exceptions/domain.exception';
import { OperationValidationException } from '../../../domain/common/exceptions/operation-validation.exception';
import { ClientNotFoundException, ClientAlreadyExistsException } from '../../../application/exceptions/client.exceptions';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should map ClientNotFoundException to 404 Not Found', () => {
    const error = new ClientNotFoundException('uuid-1');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Client not found: uuid-1',
      }),
    );
  });

  it('should map ClientAlreadyExistsException to 409 Conflict', () => {
    const error = new ClientAlreadyExistsException('XYZ850101XXX');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        message: 'A client with RFC XYZ850101XXX already exists',
      }),
    );
  });

  it('should map OperationValidationException to 422 Unprocessable Entity with details', () => {
    const validationErrors = [
      { folio: 'FOL-001', reason: 'Amount must be greater than zero' },
    ];
    const error = new OperationValidationException(validationErrors);
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Operation validation failed',
        errors: validationErrors,
      }),
    );
  });

  it('should map DomainException to 422 Unprocessable Entity', () => {
    const error = new DomainException('Some domain invariant failed');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Some domain invariant failed',
      }),
    );
  });

  it('should map standard Nest HttpException to its own status', () => {
    const error = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
      }),
    );
  });
});
