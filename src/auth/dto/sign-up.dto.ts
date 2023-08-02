import { ApiProperty } from '@nestjs/swagger';
import { AccountTypes } from '@prisma/client';
export class SignUpDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  accountType?: AccountTypes;
}
