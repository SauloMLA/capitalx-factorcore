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

export class InvoiceInputDto {
  @IsUUID('4', { message: 'Invoice ID must be a valid UUID v4' })
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  folio!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i, {
    message: 'Debtor RFC must be a valid 12-character Mexican moral person RFC',
  })
  debtorRfc!: string;

  @IsString()
  @IsNotEmpty()
  debtorName!: string;

  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount!: number;

  @Type(() => Date)
  @IsDate({ message: 'Issue date must be a valid date' })
  @IsNotEmpty()
  issueDate!: Date;

  @Type(() => Date)
  @IsDate({ message: 'Due date must be a valid date' })
  @IsNotEmpty()
  dueDate!: Date;
}

export class CreateOperationDto {
  @IsUUID('4', { message: 'Operation ID must be a valid UUID v4' })
  @IsNotEmpty()
  operationId!: string;

  @IsUUID('4', { message: 'Client ID must be a valid UUID v4' })
  @IsNotEmpty()
  clientId!: string;

  @Type(() => Date)
  @IsDate({ message: 'Request date must be a valid date' })
  @IsNotEmpty()
  requestDate!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceInputDto)
  invoices!: InvoiceInputDto[];
}
