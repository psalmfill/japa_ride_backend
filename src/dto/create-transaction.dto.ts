import { ApiProperty } from '@nestjs/swagger';
import { Genders, TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  tx_type: string;

  @ApiProperty()
  currencyId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  channel: string;

  @ApiProperty()
  status: TransactionStatus;
}
