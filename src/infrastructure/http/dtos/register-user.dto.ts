import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'operador@empresa.com',
  })
  @IsEmail({}, { message: 'Dirección de correo electrónico inválida' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    description: 'Nombre completo o razón social del usuario',
    example: 'Ana Operadora',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({
    description: 'Rol del usuario dentro de la plataforma',
    enum: UserRole,
    example: UserRole.OPERATOR,
  })
  @IsEnum(UserRole, { message: 'El rol especificado es inválido' })
  role!: UserRole;

  @ApiPropertyOptional({
    description: 'ID de la empresa cliente asociada (opcional si es Administrador Global)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El clientId debe ser un UUID v4 válido' })
  clientId?: string;
}
