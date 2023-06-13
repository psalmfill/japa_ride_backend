import { ApiProperty } from '@nestjs/swagger';
export class VerifyOtpDto {
  @ApiProperty()
  otp: string;

  @ApiProperty()
  email: string;
}
