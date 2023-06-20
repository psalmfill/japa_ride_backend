import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateCityDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  shortCode: string;

  @ApiProperty()
  stateId: string;
}
