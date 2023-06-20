import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateConfigDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  type: string;
}
