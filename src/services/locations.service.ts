import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { CreateCityDto } from 'src/dto/create-city.dto';
import { CreateCountryDto } from 'src/dto/create-country.dto';
import { CreateStateDto } from 'src/dto/create-state.dto';
import { UpdateCityDto } from 'src/dto/update-city.dto';
import { UpdateCountryDto } from 'src/dto/update-country.dto';
import { UpdateStateDto } from 'src/dto/update-state.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prismaService: PrismaService) {}

  async getCountries() {
    return await this.prismaService.country.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCountry(createCountryDto: CreateCountryDto) {
    try {
      return await this.prismaService.country.create({
        data: createCountryDto,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new HttpException(
            'State with name already exist',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException('Unknown error', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async findOneCountry(countryId: string) {
    return await this.prismaService.country.findFirst({
      where: { id: countryId },
    });
  }

  async updateCountry(countryId: string, updateCountryDto: UpdateCountryDto) {
    return await this.prismaService.country.update({
      where: { id: countryId },
      data: updateCountryDto,
    });
  }

  async removeCountry(countryId: string) {
    return await this.prismaService.country.delete({
      where: { id: countryId },
    });
  }

  async getStates(countryId: string) {
    return await this.prismaService.state.findMany({
      where: { countryId: countryId },
    });
  }

  async findOneState(stateId: string) {
    return await this.prismaService.state.findFirst({
      where: { id: stateId },
    });
  }

  async createState(createStateDto: CreateStateDto) {
    try {
      return await this.prismaService.state.create({
        data: createStateDto,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new HttpException(
            'State with name already exist',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException('Unknown error', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
  async updateState(stateId: string, updateStateDto: UpdateStateDto) {
    try {
      return await this.prismaService.state.update({
        where: { id: stateId },
        data: updateStateDto,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new HttpException(
            'State with name already exist',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException('Unknown error', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async removeState(stateId: string) {
    return await this.prismaService.state.delete({
      where: { id: stateId },
    });
  }

  async getCities(stateId: string) {
    return await this.prismaService.city.findMany({
      where: {
        stateId,
      },
    });
  }

  async createCity(createCityDto: CreateCityDto) {
    try {
      return await this.prismaService.city.create({
        data: createCityDto,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new HttpException(
            'City with name already exist',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException('Unknown error', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async updateCity(cityId: string, updateCityDto: UpdateCityDto) {
    try {
      return await this.prismaService.city.update({
        where: { id: cityId },
        data: updateCityDto,
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new HttpException(
            'City with name already exist',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException('Unknown error', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
  async removeCity(cityId: string) {
    return await this.prismaService.city.delete({
      where: { id: cityId },
    });
  }
}
