import { ApiProperty } from '@nestjs/swagger';

export class ClientSummaryResponseDto {
  @ApiProperty({
    description: 'Total number of operations created for the client',
    example: 3,
  })
  operationCount!: number;

  @ApiProperty({
    description: 'Accumulated advanced amount across all operations',
    example: 25500.00,
  })
  totalAdvancedAmount!: number;

  @ApiProperty({
    description: 'Nearest invoice due date across all operations',
    example: '2026-08-15T00:00:00Z',
    nullable: true,
  })
  nearestDueDate!: Date | null;
}
