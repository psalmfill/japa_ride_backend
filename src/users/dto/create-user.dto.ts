import { ApiProperty } from '@nestjs/swagger';
import { AccountTypes, Genders } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  name: string;

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
  accountType?: AccountTypes;
  emailVerifiedAt?: Date;
  phoneNumberVerifiedAt?: Date;
}
