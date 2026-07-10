import { IsEmail, IsNotEmpty, IsString, Matches, IsUUID } from 'class-validator';

export class RegisterClientDto {
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/i, {
    message: 'RFC must be a valid 12-character Mexican moral person RFC (e.g. ABC010101XYZ)',
  })
  rfc!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email!: string;
}
