import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateVehicleCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  currencyId: string;
}
