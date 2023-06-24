import { Injectable } from '@nestjs/common';
import { CreateVehicleCategoryDto } from 'src/dto/create-vehicle-category.dto';
import { UpdateVehicleCategoryDto } from 'src/dto/update-vehicle-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehicleCategoriesService {
  constructor(private prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.vehicleCategory.findMany();
  }

  findOne(id: string) {
    return this.prismaService.vehicleCategory.findFirstOrThrow({
      where: { id: id },
    });
  }

  create(createVehicleCategoryDto: CreateVehicleCategoryDto) {
    const { currencyId, ...data } = createVehicleCategoryDto;
    return this.prismaService.vehicleCategory.create({
      data: {
        ...data,
        currency: {
          connect: { id: currencyId },
        },
      },
    });
  }

  update(id: string, updateVehicleDto: UpdateVehicleCategoryDto) {
    return this.prismaService.vehicleCategory.update({
      where: { id },
      data: updateVehicleDto,
    });
  }

  async remove(id: string) {
    return this.prismaService.vehicleCategory.delete({
      where: { id },
    });
  }
}
