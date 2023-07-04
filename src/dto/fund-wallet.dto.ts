import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class FundWalletDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  currencySymbol?: string;

  userId: string;
  currencyId: string;
}
