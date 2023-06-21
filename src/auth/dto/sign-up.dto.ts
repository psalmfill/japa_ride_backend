import { ApiProperty } from '@nestjs/swagger';
export class SignUpDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  accountType?: string;
}
