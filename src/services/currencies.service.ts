import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from 'src/dto/create-currency.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  constructor(private prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.currency.findMany();
  }

  findOne(id: string) {
    return this.prismaService.currency.findFirstOrThrow({
      where: { id: id },
    });
  }

  findOneBySymbol(symbol: string) {
    return this.prismaService.currency.findFirst({
      where: { symbol: symbol },
    });
  }

  create(createCurrencyDto: CreateCurrencyDto) {
    return this.prismaService.currency.create({
      data: createCurrencyDto,
    });
  }

  update(id: string, updateCurrencyDto: CreateCurrencyDto) {
    return this.prismaService.currency.update({
      where: { id },
      data: updateCurrencyDto,
    });
  }

  remove(id: string) {
    return this.prismaService.currency.delete({
      where: { id },
    });
  }
}
