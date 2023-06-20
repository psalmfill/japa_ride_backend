import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateStateDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortCode: string;

  @ApiProperty()
  countryId: string;
}
