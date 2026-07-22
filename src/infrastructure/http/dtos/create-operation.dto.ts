import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la validación y transporte de cada factura dentro del lote de origen.
 */
export class InvoiceInputDto {
  @ApiProperty({
    description: 'Folio o referencia única de la factura',
    example: 'FAC-001',
  })
  @IsString()
  @IsNotEmpty()
  folio!: string;

  @ApiProperty({
    description: 'RFC del deudor (12 caracteres)',
    example: 'DEF020202ABC',
  })
  @IsString()
  @IsNotEmpty()
  // Valida que el RFC del deudor que debe pagar la factura cumpla con el formato de Persona Moral
  @Matches(/^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i, {
    message: 'Debtor RFC must be a valid 12-character Mexican moral person RFC',
  })
  debtorRfc!: string;

  @ApiProperty({
    description: 'Nombre legal o razón social del deudor',
    example: 'Distribuidora Nacional S.A.',
  })
  @IsString()
  @IsNotEmpty()
  debtorName!: string;

  @ApiProperty({
    description: 'Monto total de la factura (debe ser mayor a cero)',
    example: 250000.50,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount!: number;

  @ApiProperty({
    description: 'Fecha de emisión de la factura (formato ISO)',
    example: '2026-07-01T00:00:00Z',
  })
  // Type indica a class-transformer que parsee el texto JSON a una instancia de Date real
  @Type(() => Date)
  @IsDate({ message: 'Issue date must be a valid date' })
  @IsNotEmpty()
  issueDate!: Date;

  @ApiProperty({
    description: 'Fecha de vencimiento de la factura para pago (formato ISO)',
    example: '2026-08-30T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @IsNotEmpty()
  dueDate!: Date;
}

/**
 * DTO de entrada para la creación de una operación de factoraje.
 * Capa: HTTP / Presentación (Http Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Validar la sintaxis y los tipos de datos de la solicitud HTTP POST /operaciones.
 * Asegura que se envíe un lote de facturas estructurado y un ID de cliente válido.
 */
export class CreateOperationDto {
  @ApiProperty({
    description: 'ID único del cliente previamente aprobado (UUID v4)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Client ID must be a valid UUID v4' })
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({
    description: 'Fecha en la que se solicita la originación de la operación (formato ISO)',
    example: '2026-07-10T12:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Request date must be a valid date' })
  @IsNotEmpty()
  requestDate!: Date;

  @ApiProperty({
    description: 'Lote de facturas que conforman la operación a financiar',
    type: [InvoiceInputDto],
  })
  @IsArray()
  // ValidateNested obliga a validador a recorrer y comprobar cada InvoiceInputDto dentro del arreglo
  @ValidateNested({ each: true })
  @Type(() => InvoiceInputDto)
  invoices!: InvoiceInputDto[];
}
