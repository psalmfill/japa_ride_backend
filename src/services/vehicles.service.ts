import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from 'src/dto/create-vehicle.dto';
import { UpdateVehicleDto } from 'src/dto/update-vehicle.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prismaService: PrismaService) {}

  findMany(skip: number = 0, take: number = 10) {
    return this.prismaService.vehicle.findMany({
      include: {
        user: true,
        vehicleCategory: true,
      },
      skip,
      take,
    });
  }

  findOne(id: string) {
    return this.prismaService.vehicle.findFirst({
      where: { id: id },
      include: {
        user: true,
        vehicleCategory: true,
      },
    });
  }

  create(createVehicleDto: CreateVehicleDto) {
    const { vehicleCategoryId, userId, ...data } = createVehicleDto;
    return this.prismaService.vehicle.create({
      data: {
        ...data,
        vehicleCategory: {
          connect: { id: vehicleCategoryId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: true,
        vehicleCategory: true,
      },
    });
  }

  update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const { vehicleCategoryId, userId, ...data } = updateVehicleDto;
    return this.prismaService.vehicle.update({
      where: { id },
      data: {
        ...data,
        vehicleCategory: {
          connect: { id: vehicleCategoryId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: true,
        vehicleCategory: true,
      },
    });
  }

  async remove(id: string) {
    // todo remove image from folder
    return this.prismaService.vehicle.delete({
      where: { id },
    });
  }
}
