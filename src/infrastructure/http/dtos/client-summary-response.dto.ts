import { ApiProperty } from '@nestjs/swagger';

export class ClientSummaryResponseDto {
  @ApiProperty({
    description: 'Número total de operaciones fondeadas para este cliente',
    example: 3,
  })
  operationCount!: number;

  @ApiProperty({
    description: 'Suma del monto adelantado acumulado en todas las operaciones',
    example: 25500.00,
  })
  totalAdvancedAmount!: number;

  @ApiProperty({
    description: 'Fecha de vencimiento más próxima de todas las facturas del cliente',
    example: '2026-08-15T00:00:00Z',
    nullable: true,
  })
  nearestDueDate!: Date | null;
}
