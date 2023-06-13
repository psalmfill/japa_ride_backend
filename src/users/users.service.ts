import { PrismaService } from './../prisma/prisma.service';
import { User as UserModel } from '@prisma/client';
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
    const user = await this.prismaService.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });
    if (!user) {
      return this.prismaService.user.create({
        data: {
          ...createUserDto,
          referralCode: await this.generateReferralCode(),
        },
      });
    }
    // update the user
    // remove the password field
    const { password, referralCode, ...data } = createUserDto;
    if (
      typeof data.name === 'object' &&
      !Array.isArray(data.name) &&
      data.name !== null
    ) {
      data.name = data['name']['givenName'];
    }

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
