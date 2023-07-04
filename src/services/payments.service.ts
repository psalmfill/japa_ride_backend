import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from 'src/dto/create-payment.dto';
import { UpdateRideDto } from 'src/dto/update-ride.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RideActivity } from './rides.service';
import { UpdatePaymentDto } from 'src/dto/update-payment.dto';
import { FundWalletDto } from 'src/dto/fund-wallet.dto';
import { randomUUID } from 'crypto';
import { PaymentStatus, TransactionType } from '@prisma/client';

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
        transaction: true,
      },
    });
  }
  findOneByReference(reference: string) {
    return this.prismaService.payment.findFirst({
      where: { reference: reference },
      include: {
        user: true,
        currency: true,
        transaction: true,
        ride: true,
      },
    });
  }

  findOneForUser(userId: string, id: string) {
    return this.prismaService.payment.findFirst({
      where: { id: id },
      include: {
        user: true,
        currency: true,
        transaction: true,
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

  async fundWallet(data: FundWalletDto) {
    return await this.prismaService.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          user: {
            connect: { id: data.userId },
          },
          currency: {
            connect: { id: data.currencyId },
          },
          amount: data.amount,
          reference: 'JRT-' + randomUUID(),
          channel: 'deposit',
          tx_type: TransactionType.credit,
        },
      });
      const payment = await tx.payment.create({
        data: {
          amount: transaction.amount.toNumber(),
          gateway: 'paystack',
          reference: 'JRP-' + randomUUID(),
          status: PaymentStatus.pending,
          currency: {
            connect: { id: transaction.currencyId },
          },
          user: {
            connect: { id: transaction.userId },
          },
          transaction: {
            connect: { id: transaction.id },
          },
        },
        include: {
          user: true,
        },
      });
      return payment;
    });
  }
}
