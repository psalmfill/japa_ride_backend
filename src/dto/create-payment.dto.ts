import { ApiProperty } from '@nestjs/swagger';
import { Genders, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty()
  reference: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  currencyId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  gateway: string;

  @ApiProperty()
  fee?: number;

  @ApiProperty()
  discount?: number;

  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  transactionId?: string;

  @ApiProperty()
  rideId?: string;
}
