import { Injectable } from '@nestjs/common';
import { RideStatus } from '@prisma/client';
import { CreateRideDto } from 'src/dto/create-ride.dto';
import { UpdateRideDto } from 'src/dto/update-ride.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export enum RideActivity {
  createdRide = 'User created ride',
  riderAssigned = 'Rider assigned to ride',
  cancelledRide = 'User cancelled ride',
  declinedRide = 'Rider declined ride',
  acceptedRide = 'Rider accepted ride',
  arrivedForPickup = 'Rider has arrived for pickup',
  startedRide = 'Rider started ride',
  completedRide = 'Rider completed ride',
}
@Injectable()
export class RidesService {
  constructor(private prismaService: PrismaService) {}

  findMany(skip: number = 0, take: number = 10) {
    return this.prismaService.ride.findMany({
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  findManyForUser(userId: string, skip: number = 0, take: number = 10) {
    return this.prismaService.ride.findMany({
      where: { userId },
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }
  findManyForRider(userId: string, skip: number = 0, take: number = 10) {
    return this.prismaService.ride.findMany({
      where: {
        vehicle: {
          userId,
        },
      },
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  findManyByStatus(status: RideStatus) {
    return this.prismaService.ride.findMany({
      where: {
        status,
      },
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.ride.findFirst({
      where: { id: id },
      include: {
        user: true,
        payments: true,
        vehicle: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  findOneForUser(userId: string, id: string) {
    return this.prismaService.ride.findFirst({
      where: { id: id },
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
    });
  }
  findOneForRider(userId: string, id: string) {
    return this.prismaService.ride.findFirst({
      where: {
        vehicle: {
          userId,
        },
      },
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
    });
  }
  async create(createRideDto: CreateRideDto) {
    const { userId, vehicleId, vehicleCategoryId, currencyId, ...data } =
      createRideDto;

    const ride = await this.prismaService.ride.create({
      data: {
        ...data,
        currency: {
          connect: { id: currencyId },
        },
        user: {
          connect: { id: userId },
        },
        vehicleCategory: {
          connect: { id: vehicleCategoryId },
        },
        activities: {
          create: {
            userId,
            activity: RideActivity.createdRide,
          },
        },
      },
      include: {
        user: true,
        vehicle: true,
        payments: true,
        currency: true,
        activities: {
          include: {
            user: true,
          },
        },
      },
    });

    return ride;
  }

  update(id: string, updateVehicleDto: UpdateRideDto) {
    // const { userId, vehicleId, currencyId, ...data } = updateVehicleDto;
    return this.prismaService.ride.update({
      where: { id },
      data: updateVehicleDto,
    });
  }

  async remove(id: string) {
    return this.prismaService.ride.delete({
      where: { id },
    });
  }

  async updateRideActivity(id, userId, activity: RideActivity) {
    return this.prismaService.rideActivity.create({
      data: {
        ride: {
          connect: { id },
        },
        user: {
          connect: { id: userId },
        },
        activity,
      },
    });
  }

  async getRideActivityByActivity(rideId: string, activity: string) {
    return this.prismaService.rideActivity.findFirst({
      where: {
        rideId,
        activity: {
          equals: activity,
          mode: 'insensitive',
        },
      },
    });
  }
}
