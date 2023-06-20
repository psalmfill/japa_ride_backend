import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateRoleDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  permissions?: string[];
}
