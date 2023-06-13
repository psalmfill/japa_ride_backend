import { Genders, User as UserModel } from '@prisma/client';
export class User implements UserModel {
  id: string;
  name: string;
  email: string;
  password: string;
  image: string;
  username: string;
  gender: Genders;
  phoneNumber: string;
  bio: string;
  provider: string;
  providerId: string;
  otpCounter: number;
  referrerId: string;
  referralCode;
  referral: UserModel;
  dateOfBirth: Date;
  phoneNumberVerifiedAt: Date;
  emailVerifiedAt: Date;
  websocketId: string;
  createdAt: Date;
  updatedAt: Date;
}
