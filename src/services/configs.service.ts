import { Injectable } from '@nestjs/common';
import { CreateConfigDto } from 'src/dto/create-config.dto';
import { UpdateConfigDto } from 'src/dto/update-config.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConfigsService {
  constructor(private prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.config.findMany();
  }

  findOne(id: string) {
    return this.prismaService.config.findFirst({
      where: { id: id },
    });
  }

  create(createConfigDto: CreateConfigDto) {
    return this.prismaService.config.create({
      data: createConfigDto,
    });
  }

  update(id: string, updateConfigDto: UpdateConfigDto) {
    return this.prismaService.config.update({
      where: { id },
      data: updateConfigDto,
    });
  }

  async remove(id: string) {
    const config = await this.prismaService.config.findFirstOrThrow({
      where: { id },
    });
    if (config.type == 'system') {
      throw new Error('Cannot delete system config');
    }
    return this.prismaService.config.delete({
      where: { id },
    });
  }
}
