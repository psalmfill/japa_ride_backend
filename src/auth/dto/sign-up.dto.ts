import { ApiProperty } from '@nestjs/swagger';
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
  accountType?: string;
}
