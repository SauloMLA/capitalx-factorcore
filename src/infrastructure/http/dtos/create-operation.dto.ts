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
  @ValidateNested({ each: true })
  @Type(() => InvoiceInputDto)
  invoices!: InvoiceInputDto[];
}
