import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from 'src/dto/create-payment.dto';
import { UpdateRideDto } from 'src/dto/update-ride.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RideActivity } from './rides.service';
import { UpdatePaymentDto } from 'src/dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prismaService: PrismaService) {}

  findMany(skip: number = 0, take: number = 10) {
    return this.prismaService.payment.findMany({
      include: {
        user: true,
        currency: true,
        ride: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  findManyForUser(userId: string, skip: number = 0, take: number = 10) {
    return this.prismaService.payment.findMany({
      where: { userId },
      include: {
        user: true,
        currency: true,
        ride: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  findOne(id: string) {
    return this.prismaService.payment.findFirst({
      where: { id: id },
      include: {
        user: true,
        currency: true,
      },
    });
  }

  findOneForUser(userId: string, id: string) {
    return this.prismaService.payment.findFirst({
      where: { id: id },
      include: {
        user: true,
        currency: true,
        ride: true,
      },
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const { userId, currencyId, rideId, transactionId, ...data } =
      createPaymentDto;

    const payment = await this.prismaService.payment.create({
      data: {
        ...data,
        currency: {
          connect: { id: currencyId },
        },
        user: {
          connect: { id: userId },
        },

        ride: {
          connect: { id: rideId },
        },
      },
      include: {
        user: true,
        currency: true,
        transaction: true,
      },
    });

    return payment;
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {
    // const { userId, vehicleId, currencyId, ...data } = updateVehicleDto;
    return this.prismaService.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  async remove(id: string) {
    return this.prismaService.payment.delete({
      where: { id },
    });
  }
}
