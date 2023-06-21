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
    return this.prismaService.vehicleCategory.findFirst({
      where: { id: id },
    });
  }

  create(createVehicleCategoryDto: CreateVehicleCategoryDto) {
    return this.prismaService.vehicleCategory.create({
      data: createVehicleCategoryDto,
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
