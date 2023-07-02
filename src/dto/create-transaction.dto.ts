import { ApiProperty } from '@nestjs/swagger';
import { Genders, TransactionStatus, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  tx_type: TransactionType;

  @ApiProperty()
  currencyId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  channel: string;

  @ApiProperty()
  status: TransactionStatus;
}
