import { PrismaService } from './../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehicleCategoriesService } from './../services/vehicle-categories.service';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/admin-guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { CreateCityDto } from 'src/dto/create-city.dto';
import { CreateConfigDto } from 'src/dto/create-config.dto';
import { CreateCountryDto } from 'src/dto/create-country.dto';
import { CreateCurrencyDto } from 'src/dto/create-currency.dto';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { CreateStateDto } from 'src/dto/create-state.dto';
import { CreateVehicleCategoryDto } from 'src/dto/create-vehicle-category.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { UpdateCityDto } from 'src/dto/update-city.dto';
import { UpdateCountryDto } from 'src/dto/update-country.dto';
import { UpdateStateDto } from 'src/dto/update-state.dto';
import { UpdateVehicleCategoryDto } from 'src/dto/update-vehicle-category.dto';
import { editFileName, formatPagination } from 'src/helpers';
import { ConfigsService } from 'src/services/configs.service';
import { CurrenciesService } from 'src/services/currencies.service';
import { LocationsService } from 'src/services/locations.service';
import { PaymentsService } from 'src/services/payments.service';
import { RidesService } from 'src/services/rides.service';
import { RolesService } from 'src/services/roles.service';
import { VehiclesService } from 'src/services/vehicles.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { diskStorage } from 'multer';
import { existsSync, unlinkSync } from 'fs';
import { TransactionsService } from 'src/services/transactions.service';
import {
  AccountTypes,
  PaymentStatus,
  RideStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
    private readonly currenciesService: CurrenciesService,
    private readonly configsService: ConfigsService,
    private readonly vehicleCategoriesService: VehicleCategoriesService,
    private readonly rolesService: RolesService,
    private readonly vehiclesService: VehiclesService,
    private readonly ridesService: RidesService,
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('analytics')
  async analytics() {
    return {
      users: {
        totalDrivers: await this.prismaService.user.count({
          where: {
            accountType: AccountTypes.rider,
          },
        }),
        totalAdmins: await this.prismaService.user.count({
          where: {
            accountType: AccountTypes.admin,
          },
        }),
        totalCustomers: this.prismaService.user.count({
          where: {
            accountType: AccountTypes.user,
          },
        }),
      },

      transactions: {
        totalCreditCount: await this.prismaService.transaction.count({
          where: {
            tx_type: TransactionType.credit,
            status: TransactionStatus.completed,
          },
        }),
        totalCreditAmount:
          (
            await this.prismaService.transaction.aggregate({
              where: {
                tx_type: TransactionType.credit,
                status: TransactionStatus.completed,
              },
              _sum: {
                amount: true,
              },
            })
          )._sum.amount || 0,
        totalDebitCount: await this.prismaService.transaction.count({
          where: {
            tx_type: TransactionType.debit,
            status: TransactionStatus.completed,
          },
        }),
        totalDebitAmount:
          (
            await this.prismaService.transaction.aggregate({
              where: {
                tx_type: TransactionType.debit,
                status: TransactionStatus.completed,
              },
              _sum: {
                amount: true,
              },
            })
          )._sum.amount || 0,
      },
      totalPaymentsCount: {
        totalCount: await this.prismaService.payment.count({
          where: {
            status: PaymentStatus.completed,
          },
        }),
        totalAmount:
          (
            await this.prismaService.transaction.aggregate({
              where: {
                status: PaymentStatus.completed,
              },
              _sum: {
                amount: true,
              },
            })
          )._sum.amount || 0,
      },
      totalRidesCount: {
        totalCount: await this.prismaService.ride.count({}),
        totalPending: await this.prismaService.ride.count({
          where: {
            status: RideStatus.pending,
          },
        }),

        totalCancelled: await this.prismaService.ride.count({
          where: {
            status: RideStatus.cancelled,
          },
        }),
        totalDeclined: await this.prismaService.ride.count({
          where: {
            status: RideStatus.declined,
          },
        }),
        totalCompleted: await this.prismaService.ride.count({
          where: {
            status: RideStatus.completed,
          },
        }),
      },
    };
  }

  @Post('configs')
  createConfig(@Body() createConfigDto: CreateConfigDto) {
    return this.configsService.create(createConfigDto);
  }

  @Get('configs')
  async findAllConfigs() {
    return await this.configsService.findAll();
  }

  @Get('configs/:id')
  findOneConfig(@Param('id') id: string) {
    return this.configsService.findOne(id);
  }

  @Patch('configs/:id')
  updateConfig(
    @Param('id') id: string,
    @Body() updateConfigDto: CreateConfigDto,
  ) {
    return this.configsService.update(id, updateConfigDto);
  }

  @Delete('configs/:id')
  removeConfig(@Param('id') id: string) {
    return this.configsService.remove(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('users')
  async findAll(@Query() pagination: PaginationDto) {
    const response = await this.usersService.findAll(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('users/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('passengers')
  async findPassengers(@Query() pagination: PaginationDto) {
    const response = await this.usersService.findPassengers(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('passengers/:id')
  findOnePassenger(@Param('id') id: string) {
    return this.usersService.findOnePassenger(id);
  }

  @Get('drivers')
  async findDriver(@Query() pagination: PaginationDto) {
    const response = await this.usersService.findDrivers(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('drivers/:id')
  findOneDriver(@Param('id') id: string) {
    return this.usersService.findOneDriver(id);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('users/:id/transactions')
  userTransactions(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    const response = this.transactionsService.findManyForUser(
      id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('users/:id/payments')
  userPayments(@Param('id') id: string, @Query() pagination: PaginationDto) {
    const response = this.paymentsService.findManyForUser(
      id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('users/:id/rides')
  userRides(@Param('id') id: string, @Query() pagination: PaginationDto) {
    const response = this.ridesService.findManyForUser(
      id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  // RIDER
  @Get('rider/:id/transactions')
  riderTransactions(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    const response = this.transactionsService.findManyForUser(
      id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('riders/:id/payments')
  riderPayments(@Param('id') id: string, @Query() pagination: PaginationDto) {
    const response = this.paymentsService.findManyForUser(
      id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('riders/:id/rides')
  riderRides(@Param('id') id: string, @Query() pagination: PaginationDto) {
    const response = this.ridesService.findManyForRider(
      id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  // currency

  @Post('currencies')
  createCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Get('currencies')
  async findAllCurrencies() {
    return await this.currenciesService.findAll();
  }

  @Get('currencies/:id')
  findOneCurrency(@Param('id') id: string) {
    try {
      return this.currenciesService.findOne(id);
    } catch (err) {
      throw new HttpException(err, HttpStatus.NOT_FOUND);
    }
  }

  @Patch('currencies/:id')
  updateCurrency(
    @Param('id') id: string,
    @Body() updateCurrencyDto: CreateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Delete('currencies/:id')
  removeCurrency(@Param('id') id: string) {
    return this.currenciesService.remove(id);
  }

  // Locations

  @Post('locations/countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationsService.createCountry(createCountryDto);
  }

  @Get('locations/countries')
  async findAllCountries() {
    return await this.locationsService.getCountries();
  }

  @Get('locations/countries/:id')
  findOneCountry(@Param('id') id: string) {
    return this.locationsService.findOneCountry(id);
  }

  @Patch('locations/countries/:id')
  updateCountry(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.locationsService.updateCountry(id, updateCountryDto);
  }

  @Delete('locations/countries/:id')
  removeCountry(@Param('id') id: string) {
    return this.locationsService.removeCountry(id);
  }

  // States

  @Post('locations/countries/:id/states')
  createState(@Param('id') id: string, @Body() createStateDto: CreateStateDto) {
    return this.locationsService.createState(createStateDto);
  }

  @Get('locations/countries/:id/states')
  async findAllStates(@Param('id') id: string) {
    return await this.locationsService.getStates(id);
  }

  @Get('locations/states/:stateId')
  findOneState(@Param('id') id: string, @Param('stateId') stateId: string) {
    return this.locationsService.findOneState(stateId);
  }

  @Patch('locations/states/:stateId')
  updateState(
    @Param('id') id: string,
    @Param('stateId') stateId: string,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.locationsService.updateState(stateId, updateStateDto);
  }

  @Delete('locations/countries/:id/states/:stateId')
  removeState(@Param('id') id: string, @Param('stateId') stateId: string) {
    return this.locationsService.removeState(stateId);
  }

  // cities

  @Post('locations/states/:id/cities')
  createCity(@Param('id') id: string, @Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }

  @Get('locations/states/:id/cities')
  async findAllCities(@Param('id') id: string) {
    return await this.locationsService.getCities(id);
  }

  @Get('locations/cities/:cityId')
  findOneCity(@Param('id') id: string, @Param('cityId') cityId: string) {
    return this.locationsService.findOneState(cityId);
  }

  @Patch('locations/cities/:cityId')
  updateCity(
    @Param('id') id: string,
    @Param('cityId') cityId: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.locationsService.updateCity(cityId, updateCityDto);
  }

  @Delete('locations/states/:id/cities/:cityId')
  removeCity(@Param('id') id: string, @Param('cityId') cityId: string) {
    return this.locationsService.removeCity(cityId);
  }

  // vehicle categories

  @Post('vehicle-categories')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
    }),
  )
  createVehicleCategory(
    @Body() createVehicleCategoryDto: CreateVehicleCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      createVehicleCategoryDto.image = file.path;
      return this.vehicleCategoriesService.create(createVehicleCategoryDto);
    } catch (err) {
      console.log(err);
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      }

      throw new HttpException(
        'Could not create vehicle category',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get('vehicle-categories')
  async findAllVehicleCategories() {
    return await this.vehicleCategoriesService.findAll();
  }

  @Get('vehicle-categories/:id')
  findOneVehicleCategory(@Param('id') id: string) {
    return this.vehicleCategoriesService.findOne(id);
  }

  @Patch('vehicle-categories/:id')
  updateVehicleCategory(
    @Param('id') id: string,
    @Body() updateVehicleCategoryDto: UpdateVehicleCategoryDto,
  ) {
    return this.vehicleCategoriesService.update(id, updateVehicleCategoryDto);
  }

  @Delete('vehicle-categories/:id')
  removeVehicleCategory(@Param('id') id: string) {
    return this.vehicleCategoriesService.remove(id);
  }

  //  roles and permissions
  @Get('permission')
  getPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get('roles')
  async findAllRoles() {
    return await this.rolesService.findAll();
  }

  @Get('roles/:id')
  findOneRole(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: CreateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete('roles/:id')
  removeRole(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('vehicles')
  async getVehicles(@Query() pagination: PaginationDto) {
    const response = await this.vehiclesService.findMany(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('vehicles/:id')
  getVehicle(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('payments')
  async getPayments(@Req() req, @Query() pagination: PaginationDto) {
    const response = await this.paymentsService.findMany(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('payments/:id')
  getPayment(@Req() req, @Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('rides')
  async getRides(@Req() req, @Query() pagination: PaginationDto) {
    const response = await this.ridesService.findMany(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('rides/:id')
  getRide(@Req() req, @Param('id') id: string) {
    return this.ridesService.findOne(id);
  }
  @Get('transactions')
  transactions(@Req() req, @Query() pagination: PaginationDto) {
    const response = this.transactionsService.findMany(
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('transactions/:id')
  transaction(@Req() req, @Param('id') id: string) {
    const response = this.transactionsService.findOneForUser(req.user.id, id);
    return response;
  }
}
