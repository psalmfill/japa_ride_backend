import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateCountryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortCode: string;

  @ApiProperty()
  phoneCode: string;
}
