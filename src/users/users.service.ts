import { PrismaService } from './../prisma/prisma.service';
import { AccountTypes, User, User as UserModel } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto): Promise<UserModel> {
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        referralCode: await this.generateReferralCode(),
      },
    });
  }

  async createOrUpdate(createUserDto: CreateUserDto): Promise<UserModel> {
    const { referrerId, ...userDto } = createUserDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });
    if (!user) {
      return this.prismaService.user.create({
        data: {
          ...userDto,
          referralCode: await this.generateReferralCode(),
          referrer: {
            connect: { id: referrerId },
          },
        },
      });
    }
    // update the user
    // remove the password field
    const { password, referralCode, ...data } = createUserDto;
    // if (
    //   typeof data.firstName === 'object' &&
    //   !Array.isArray(data.name) &&
    //   data.name !== null
    // ) {
    //   data.name = data['name']['givenName'];
    // }

    return this.prismaService.user.update({
      where: { id: user.id },
      data: data,
    });
  }

  findAll(): Promise<UserModel[]> {
    return this.prismaService.user.findMany();
  }

  findOne(id: string): Promise<UserModel> {
    return this.prismaService.user.findUniqueOrThrow({ where: { id } });
  }
  findOneByEmail(email: string): Promise<UserModel> {
    return this.prismaService.user.findUniqueOrThrow({ where: { email } });
  }

  findOneByProviderId(providerId: string): Promise<UserModel> {
    return this.prismaService.user.findFirstOrThrow({ where: { providerId } });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<UserModel> {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async findRiderWithinRange(
    latitude: number,
    longitude: number,
    distanceInMile,
  ): Promise<User> {
    latitude = parseFloat(latitude.toFixed(3));
    longitude = parseFloat(longitude.toFixed(3));
    const userType: AccountTypes = AccountTypes.rider;
    return await this.prismaService.$queryRaw`select "u".* from ( 
        select *, ( 3959 * acos( cos( radians( ${latitude}) ) * cos( radians( "currentLatitude") ) * cos( radians( "currentLongitude") - radians( ${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( "currentLatitude") ) ) ) 
         AS "distance" from "User") as "u"   where  ("accountType"::text = ${userType} and "currentLatitude" is not null and "currentLongitude" is not null and "websocketId" is not null ) and "distance" <  ${distanceInMile} order by "distance" asc`;
  }

  async generateReferralCode() {
    while (true) {
      const code = this.makeString(8);
      const user = await this.prismaService.user.findFirst({
        where: { referralCode: code },
      });
      if (user) {
        continue;
      }
      return code;
    }
  }

  makeString(length) {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
