import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  password: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  username?: string;

  @ApiProperty()
  gender?: Genders;

  @ApiProperty()
  phoneNumber?: string;

  @ApiProperty()
  bio?: string;
  provider?: string;
  providerId?: string;
  otpCounter?: number;
  websocketId?: string;
  referralCode?: string;
  referrerId?: string;

  @ApiProperty()
  dateOfBirth?: Date;
  emailVerifiedAt?: Date;
  phoneNumberVerifiedAt?: Date;
}
