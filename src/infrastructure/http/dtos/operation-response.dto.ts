import { ApiProperty } from '@nestjs/swagger';

export class OperationResponseDto {
  @ApiProperty({
    description: 'The created operation ID',
    example: '923e4567-e89b-12d3-a456-426614174000',
  })
  operationId!: string;

  @ApiProperty({
    description: 'Sum of all invoice amounts in the operation',
    example: 10000.0,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'Advanced amount (85% of total)',
    example: 8500.0,
  })
  advancedAmount!: number;

  @ApiProperty({
    description: 'Factoring fee commission (1.5% of total)',
    example: 150.0,
  })
  commission!: number;

  @ApiProperty({
    description: 'Net amount to deposit (advanced - commission)',
    example: 8350.0,
  })
  depositAmount!: number;
}
