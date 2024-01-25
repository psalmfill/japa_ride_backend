import { CurrenciesService } from './../services/currencies.service';
import { TransactionsService } from './../services/transactions.service';
import { RideGateway } from './../gateways/ride.gateway';
import { VehicleCategoriesService } from 'src/services/vehicle-categories.service';
import { RideActivity, RidesService } from 'src/services/rides.service';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AccountService } from './account.service';
import { JwtAuthGuard } from './../auth/guards/jwt-guard';
import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/dto/pagination.dto';
import { editFileName, formatPagination, getDistance } from 'src/helpers';
import {
  PaymentMethod,
  PaymentStatus,
  RideStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { PaymentsService } from 'src/services/payments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, unlinkSync } from 'fs';
import { CreateRideDto } from 'src/dto/create-ride.dto';
import { randomUUID } from 'crypto';
import { GetPriceDto } from 'src/dto/get-price.dto';
import { FundWalletDto } from 'src/dto/fund-wallet.dto';
import {
  PaystackService,
  PaystackTransactionResponse,
} from 'src/paystack/paystack.service';
import { MapsService } from 'src/google/services/maps.service';

@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private accountService: AccountService,
    private readonly ridesService: RidesService,
    private readonly paymentsService: PaymentsService,
    private readonly vehicleCategoriesService: VehicleCategoriesService,
    private readonly rideGateway: RideGateway,
    private readonly transactionsService: TransactionsService,
    private readonly currenciesService: CurrenciesService,
    private readonly paystackService: PaystackService,
    private readonly mapsService: MapsService,
  ) {}

  @Get('profile')
  profile(@Req() req) {
    return this.accountService.getProfile(req.user.id).then((res) => {
      const { password, ...user } = res;
      return user;
    });
  }

  @Put('update-profile')
  @ApiResponse({ type: CreateUserDto })
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.accountService
      .updateProfile(req.user.id, updateUserDto)
      .then((res) => {
        const { password, ...user } = res;
        return user;
      });
  }

  @Post('update-profile-picture')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
    }),
  )
  @ApiResponse({ type: CreateUserDto })
  updateProfilePicture(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
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
      updateUserDto.image = file.path;
      return this.accountService
        .updateProfile(req.user.id, updateUserDto)
        .then((res) => {
          const { password, ...user } = res;
          return user;
        });
    } catch (err) {
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      }

      throw new HttpException(
        'Could update profile image',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('change-password')
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.accountService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Req() req, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.accountService.resetPassword(req.user.id, resetPasswordDto);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('payments')
  async getPayments(@Req() req, @Query() pagination: PaginationDto) {
    const response = await this.paymentsService.findManyForUser(
      req.user.id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('payments/:id')
  getPayment(@Req() req, @Param('id') id: string) {
    return this.paymentsService.findOneForUser(req.user.id, id);
  }

  @Get('get-price')
  async getPrice(@Req() req, @Query() getPriceDto: GetPriceDto) {
    const categories = await this.vehicleCategoriesService.findAll()
    // getPriceDto.distance = await getDistance({
    //   pickupLongitude: getPriceDto.pickupLongitude,
    //   pickupLatitude: getPriceDto.pickupLatitude,
    //   pickupAddress: getPriceDto.pickupAddress,
    //   destinationLongitude: getPriceDto.destinationLongitude,
    //   destinationAddress: getPriceDto.destinationAddress,
    //   destinationLatitude: getPriceDto.destinationLatitude,
    // });
    const distanceResponse = await this.mapsService.getDistanceMatrix(
      [
        getPriceDto.pickupAddress,
        // getPriceDto.pickupLatitude,
        // getPriceDto.pickupLongitude,
      ],
      [
        getPriceDto.destinationAddress,
        // getPriceDto.destinationLatitude,
        // getPriceDto.destinationLongitude,
      ],
    );
    getPriceDto.distance = distanceResponse.distance.value / 1000;
    
    return categories.map((category:any)=> {
       // calculate fee
    let fee = getPriceDto.distance * category.pricePerKilometer.toNumber();
    if (fee < category.basePrice.toNumber()) {
      fee = category.basePrice.toNumber();
    }
    const estimatedFee =
      fee > category.basePrice.toNumber() ? fee : category.basePrice.toNumber();
      category.estimatedFee = estimatedFee;
      category.estimatedTime = distanceResponse.duration.value;
      category.estimatedTimeFormatted = distanceResponse.duration.text;
      category.estimatedDistant = distanceResponse.distance.value
      category.estimatedDistantFormatted = distanceResponse.distance.text
      return category;
    })
  }

  @Post('request-ride')
  async requestRide(@Req() req, @Body() createRideDto: CreateRideDto) {
    // get the vehicle category
    const category = await this.vehicleCategoriesService.findOne(
      createRideDto.vehicleCategoryId,
    );
    createRideDto.distance = await getDistance({
      pickupLongitude: createRideDto.pickupLongitude,
      pickupLatitude: createRideDto.pickupLatitude,
      pickupAddress: createRideDto.pickupAddress,
      destinationLongitude: createRideDto.destinationLongitude,
      destinationAddress: createRideDto.destinationAddress,
      destinationLatitude: createRideDto.destinationLatitude,
    });
    // calculate fee
    const distanceResponse = await this.mapsService.getDistanceMatrix(
      [
        createRideDto.pickupAddress,
        createRideDto.pickupLatitude,
        createRideDto.destinationLongitude,
      ],
      [
        createRideDto.destinationAddress,
        createRideDto.destinationLatitude,
        createRideDto.destinationLongitude,
      ],
    );
    createRideDto.distance = distanceResponse.distance.value / 1000;
    // calculate fee
    let fee = createRideDto.distance * category.pricePerKilometer.toNumber();
    if (fee < category.basePrice.toNumber()) {
      fee = category.basePrice.toNumber();
    }
    const estimatedFee =
      fee > category.basePrice.toNumber() ? fee : category.basePrice.toNumber();
    createRideDto.estimatedFee = estimatedFee;
    const ride = await this.ridesService.create(createRideDto);
    // check if the user is charging from balance
    if (ride && createRideDto.paymentMethod == PaymentMethod.card) {
      // create payment
      const payment = await this.paymentsService.create({
        currencyId: createRideDto.currencyId,
        amount: createRideDto.estimatedFee,
        userId: req.user.id,
        gateway: 'paystack',
        status: PaymentStatus.pending,
        reference: randomUUID(),
        rideId: ride.id,
      });
      // create transaction on paystack
      const tx = await this.paystackService.initializePayment({
        amount: payment.amount.toNumber() * 100, // convert to kobo
        email: payment.user.email,
        reference: payment.reference,
      });
      // return the payment for frontend to lunch payment modal

      return tx;
    } else if (createRideDto.paymentMethod == PaymentMethod.wallet) {
      // check is user has sufficent balance
      const currency = await this.currenciesService.findOneBySymbol('NGN');
      const balance = await this.transactionsService.getUserCurrencyBalance(
        req.user.id,
        currency.id,
      );
      if (estimatedFee > balance) {
        throw new HttpException(
          'Insufficient Wallet balance to complete payment',
          HttpStatus.BAD_REQUEST,
        );
      }

      // create new
      const transaction = await this.transactionsService.create({
        amount: estimatedFee,
        currencyId: currency.id,
        userId: req.user.id,
        tx_type: TransactionType.debit,
        status: TransactionStatus.completed,
        reference: randomUUID(),
        channel: 'ride',
      });

      // create payment
      const payment = await this.paymentsService.create({
        currencyId: createRideDto.currencyId,
        amount: createRideDto.estimatedFee,
        userId: req.user.id,
        gateway: 'wallet',
        status: PaymentStatus.completed,
        reference: randomUUID(),
        rideId: ride.id,
        transactionId: transaction.id,
      });
      await this.ridesService.update(ride.id, {
        paymentStatus: 'paid',
      });
    }
    return this.ridesService.findOne(ride.id);
  }

  @Get('rides/:id/complete-payment')
  async completeRidePayment(
    @Req() req,
    @Param('id') id: string,
    @Query() query,
  ) {
    const ride = await this.ridesService.findOneForUser(req.user.id, id);
    if (!ride) {
      throw new NotFoundException();
    }
    const response: PaystackTransactionResponse =
      await this.paystackService.verifyTransaction(query.reference);
    if (response.status) {
      // find the payment
      const payment = await this.paymentsService.findOneByReference(
        response.data.reference,
      );
      if ((response.data.status = 'success')) {
        const updatedPayment = await this.paymentsService.update(payment.id, {
          status: PaymentStatus.completed,
        });
        if (payment.transactionId) {
          // confirm thee transaction
          await this.transactionsService.update(payment.transactionId, {
            status: TransactionStatus.completed,
          });
        }
        return await this.ridesService.update(ride.id, {
          paymentStatus: 'paid',
        });
      } else if ((response.data.status = 'failed')) {
        const updatedPayment = await this.paymentsService.update(payment.id, {
          status: PaymentStatus.failed,
        });
        if (payment.transactionId) {
          // confirm thee transaction
          await this.transactionsService.update(payment.transactionId, {
            status: TransactionStatus.failed,
          });
        }
        throw new BadRequestException();
      }
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('rides')
  async getRides(@Req() req, @Query() pagination: PaginationDto) {
    const response = await this.ridesService.findManyForUser(
      req.user.id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('rides/:id')
  getRide(@Req() req, @Param('id') id: string) {
    return this.ridesService.findOneForUser(req.user.id, id);
  }

  @Patch('rides/:id/cancel')
  async cancelRide(@Req() req, @Param('id') id: string) {
    const ride = await this.ridesService.findOneForUser(req.user.id, id);
    if (!ride) {
      throw new HttpException('Ride not found', HttpStatus.NOT_FOUND);
    }

    if (ride.userId !== req.user.id) {
      throw new HttpException(
        'You cannot cancel this ride.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (ride.status == RideStatus.cancelled) {
      throw new HttpException(
        'Ride has been Canceled.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const startActivity = await this.ridesService.getRideActivityByActivity(
      id,
      RideActivity.startedRide,
    );
    if (startActivity) {
      throw new HttpException(
        'Ride cannot be cancelled any longer.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    //   create a cancel record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      id,
      req.user.id,
      RideActivity.cancelledRide,
    );
    //   update the ride
    await this.ridesService.update(id, {
      status: RideStatus.cancelled,
    });
    //  notify rider of cancelled ride
    if (ride.vehicle) {
      this.rideGateway.server
        .to(ride.vehicle.user.websocketId)
        .emit('rideCancelled', rideActivity);
    }
    return rideActivity;
  }
  @Get('active-ride')
  getActiveRide(@Req() req) {
    return this.ridesService.getUserActiveRide(req.user.id);
  }
  @Post('fund-wallet')
  async fundWallet(@Req() req, @Body() fundWalletDto: FundWalletDto) {
    const currency = await this.currenciesService.findOneBySymbol('NGN');
    fundWalletDto.currencyId = currency.id;
    fundWalletDto.userId = req.user.id;
    const payment = await this.paymentsService.fundWallet(fundWalletDto);
    if (!payment) {
      throw new HttpException(
        'Fund wallet failed. try again',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    // create transaction on paystack
    const tx = await this.paystackService.initializePayment({
      amount: payment.amount.toNumber() * 100, // convert to kobo
      email: payment.user.email,
      reference: payment.reference,
    });
    return tx;
  }

  @Get('wallet-balances')
  getWalletBalances(@Req() req) {
    return this.transactionsService.getUserWalletBalances(req.user.id);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @Get('transactions')
  async transactions(@Req() req, @Query() pagination: PaginationDto) {
    const response = await this.transactionsService.findManyForUser(
      req.user.id,
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
