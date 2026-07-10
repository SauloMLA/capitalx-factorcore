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
    description: 'Unique invoice ID in UUID v4 format',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'Invoice ID must be a valid UUID v4' })
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'Invoice unique reference folio',
    example: 'FOL-889',
  })
  @IsString()
  @IsNotEmpty()
  folio!: string;

  @ApiProperty({
    description: 'Debtor Tax ID (12-char RFC)',
    example: 'DEF020202ABC',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i, {
    message: 'Debtor RFC must be a valid 12-character Mexican moral person RFC',
  })
  debtorRfc!: string;

  @ApiProperty({
    description: 'Debtor legal name',
    example: 'Distribuidora del Norte S.A.',
  })
  @IsString()
  @IsNotEmpty()
  debtorName!: string;

  @ApiProperty({
    description: 'Total invoice amount (must be positive)',
    example: 10000.5,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount!: number;

  @ApiProperty({
    description: 'Invoice emission date (ISO format)',
    example: '2026-07-01T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Issue date must be a valid date' })
  @IsNotEmpty()
  issueDate!: Date;

  @ApiProperty({
    description: 'Invoice payment due date (ISO format)',
    example: '2026-08-15T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @IsNotEmpty()
  dueDate!: Date;
}

export class CreateOperationDto {
  @ApiProperty({
    description: 'Unique operation ID in UUID v4 format',
    example: '923e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Operation ID must be a valid UUID v4' })
  @IsNotEmpty()
  operationId!: string;

  @ApiProperty({
    description: 'Client ID in UUID v4 format',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Client ID must be a valid UUID v4' })
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({
    description: 'Operation origin request date (ISO format)',
    example: '2026-07-10T12:00:00Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'Request date must be a valid date' })
  @IsNotEmpty()
  requestDate!: Date;

  @ApiProperty({
    description: 'List of invoices to be financed in this operation',
    type: [InvoiceInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceInputDto)
  invoices!: InvoiceInputDto[];
}
