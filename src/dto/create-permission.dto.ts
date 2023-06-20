import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreatePermissionsDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;
}
