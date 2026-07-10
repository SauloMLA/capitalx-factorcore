import { IsEmail, IsNotEmpty, IsString, Matches, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientDto {
  @ApiProperty({
    description: 'Unique client ID in UUID v4 format',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: '12-character moral person Mexican Tax ID (RFC)',
    example: 'XYZ850101XXX',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i, {
    message: 'RFC must be a valid 12-character Mexican moral person RFC (e.g. ABC010101XYZ)',
  })
  rfc!: string;

  @ApiProperty({
    description: 'Company legal name',
    example: 'Capital X Factor S.A.',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Company primary contact email',
    example: 'contacto@capitalx.mx',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email!: string;
}
