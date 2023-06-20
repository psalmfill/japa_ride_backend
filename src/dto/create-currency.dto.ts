import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateCurrencyDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;
}
