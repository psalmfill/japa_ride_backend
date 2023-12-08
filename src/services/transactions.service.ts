import { Injectable } from '@nestjs/common';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { UpdateTransactionDto } from 'src/dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prismaService: PrismaService) {}

  findMany(skip: number = 0, take: number = 10) {
    return this.prismaService.$transaction([
      this.prismaService.transaction.findMany({
        include: {
          user: true,
          currency: true,
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prismaService.transaction.count(),
    ]);
  }

  findManyForUser(userId: string, skip: number = 0, take: number = 10) {
    return this.prismaService.$transaction([
      this.prismaService.transaction.findMany({
        where: { userId },
        include: {
          user: true,
          currency: true,
          payments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prismaService.transaction.count({
        where: { userId },
      }),
    ]);
  }

  findOne(id: string) {
    return this.prismaService.transaction.findFirst({
      where: { id: id },
      include: {
        user: true,
        currency: true,
        payments: true,
      },
    });
  }

  findOneForUser(userId: string, id: string) {
    return this.prismaService.transaction.findFirst({
      where: { id: id },
      include: {
        user: true,
        currency: true,
        payments: true,
      },
    });
  }

  async create(createTransactionDto: CreateTransactionDto) {
    const { userId, currencyId, ...data } = createTransactionDto;

    const payment = await this.prismaService.transaction.create({
      data: {
        ...data,
        currency: {
          connect: { id: currencyId },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: true,
        currency: true,
        payments: true,
      },
    });

    return payment;
  }

  update(id: string, updatePaymentDto: UpdateTransactionDto) {
    // const { userId, vehicleId, currencyId, ...data } = updateVehicleDto;
    return this.prismaService.transaction.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        user: true,
        currency: true,
        payments: true,
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.transaction.delete({
      where: { id },
    });
  }

  async getUserCurrencyBalance(userId: string, currencySymbol: string) {
    const debit = await this.prismaService.transaction.aggregate({
      where: {
        userId: userId,
        tx_type: TransactionType.debit,
        currency: {
          symbol: currencySymbol,
        },
        NOT: {
          status: {
            in: [TransactionStatus.cancelled, TransactionStatus.declined],
          },
        },
      },

      _sum: {
        amount: true,
      },
    });

    const credit = await this.prismaService.transaction.aggregate({
      where: {
        userId: userId,
        tx_type: TransactionType.credit,
        status: TransactionStatus.completed,
        currency: {
          symbol: currencySymbol,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const debitAmount = debit._sum.amount || 0;
    const creditAmount = credit._sum.amount || 0;
    return Number(creditAmount) - Number(debitAmount);
  }

  async getUserWalletBalances(userId: string) {
    const currencies = await this.prismaService.currency.findMany();
    const balances = [];

    for (const currency of currencies) {
      let formatter = null;
      formatter = new Intl.NumberFormat('en-RS', {
        style: 'currency',
        currency: currency.symbol,
      });
      const balance = await this.getUserCurrencyBalance(
        userId,
        currency.symbol,
      );
      balances.push({
        currencyId: currency.id,
        currency: currency.symbol,
        balance: balance,
        balanceFormatted: formatter
          ? formatter.format(balance)
          : `${currency.symbol} ${balance}`,
      });
    }
    return balances;
  }
}
