import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la respuesta de creación de Operación.
 * Capa: HTTP / Presentación (Http Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Dar formato de salida y documentar con Swagger los resultados consolidados de una originación exitosa.
 */
export class OperationResponseDto {
  @ApiProperty({
    description: 'UUID v4 generado para la operación',
    example: '923e4567-e89b-12d3-a456-426614174000',
  })
  operationId!: string;

  @ApiProperty({
    description: 'Suma de los montos de todas las facturas en la operación',
    example: 10000.0,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'Monto adelantado (Aforo del 85% sobre el total)',
    example: 8500.0,
  })
  advancedAmount!: number;

  @ApiProperty({
    description: 'Comisión cobrada por factoraje (1.5% sobre el total)',
    example: 150.0,
  })
  commission!: number;

  @ApiProperty({
    description: 'Monto neto a depositar (monto adelantado - comisión)',
    example: 8350.0,
  })
  depositAmount!: number;
}
