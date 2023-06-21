import { RideActivity, RidesService } from 'src/services/rides.service';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AccountService } from './account.service';
import { JwtAuthGuard } from './../auth/guards/jwt-guard';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from 'src/dto/pagination.dto';
import { formatPagination } from 'src/helpers';
import { RideStatus } from '@prisma/client';
import { PaymentsService } from 'src/services/payments.service';

@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private accountService: AccountService,
    private readonly ridesService: RidesService,
    private readonly paymentsService: PaymentsService,
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
    if (!ride || !ride.vehicle || ride.vehicle.userId !== req.user.id) {
      throw new HttpException(
        'You cannot cancel this ride',
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
    // todo notify rider of cancelled ride

    return rideActivity;
  }
}
