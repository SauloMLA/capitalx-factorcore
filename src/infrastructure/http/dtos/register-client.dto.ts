import { IsEmail, IsNotEmpty, IsString, Matches, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientDto {

  @ApiProperty({
    description: 'RFC de Persona Moral en México (12 caracteres alfanuméricos)',
    example: 'CAP220101XYZ',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i, {
    message: 'RFC must be a valid 12-character Mexican moral person RFC (e.g. ABC010101XYZ)',
  })
  rfc!: string;

  @ApiProperty({
    description: 'Nombre legal o razón social de la empresa',
    example: 'Capital Partner S.A.',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto principal de la empresa',
    example: 'partner@capital.mx',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email!: string;
}
