import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RideStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { PaginationDto } from 'src/dto/pagination.dto';
import { RideGateway } from 'src/gateways/ride.gateway';
import { formatPagination } from 'src/helpers';
import { RideActivity, RidesService } from 'src/services/rides.service';

@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('rider')
export class RiderController {
  constructor(
    private readonly ridesService: RidesService,
    private readonly rideGateway: RideGateway,
  ) {}

  @Get('rides')
  async getRides(@Req() req, @Query() pagination: PaginationDto) {
    const response = await this.ridesService.findManyForRider(
      req.user.id,
      +pagination.page < 2 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );
    return formatPagination(response, pagination);
  }

  @Get('active-ride')
  getActiveRide(@Req() req) {
    return this.ridesService.getRiderActiveRide(req.user.id);
  }
  @Get('rides/:id')
  getRide(@Req() req, @Param('id') id: string) {
    return this.ridesService.findOneForRider(req.user.id, id);
  }

  @Patch('rides/:id/decline')
  async declineRide(@Req() req, @Param('id') id: string) {
    const ride = await this.ridesService.findOneForRider(req.user.id, id);
    if (!ride || !ride.vehicle || ride.vehicle.userId !== req.user.id) {
      throw new HttpException(
        'You cannot decline this ride',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (ride.status == RideStatus.cancelled) {
      throw new HttpException(
        'Ride has been Canceled',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      id,
      req.user.id,
      RideActivity.declinedRide,
    );
    //   update the ride
    await this.ridesService.update(id, {
      vehicleId: null,
    });
    // notify user of decline ride
    this.rideGateway.server
      .to(ride.user.websocketId)
      .emit('rideDeclined', rideActivity);
    return rideActivity;
  }

  @Patch('rides/:id/accept')
  async acceptRide(@Req() req, @Param('id') id: string) {
    const ride = await this.ridesService.findOneForRider(req.user.id, id);
    if (!ride || !ride.vehicle || ride.vehicle.userId !== req.user.id) {
      throw new HttpException(
        'You cannot accept this ride',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (ride.status == RideStatus.cancelled) {
      throw new HttpException(
        'Ride has been Canceled',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    //   create a accept record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      id,
      req.user.id,
      RideActivity.acceptedRide,
    );
    const updatedRide = await this.ridesService.update(id, {
      status: RideStatus.inProgress,
    });
    // notify user of accepted ride
    this.rideGateway.server
      .to(ride.user.websocketId)
      .emit('rideAccepted', rideActivity);
    return updatedRide;
  }

  @Patch('rides/:id/arrive-for-pickup')
  async arrivedForPickupRide(@Req() req, @Param('id') id: string) {
    const ride = await this.ridesService.findOneForRider(req.user.id, id);
    if (!ride || !ride.vehicle || ride.vehicle.userId !== req.user.id) {
      throw new HttpException(
        'You cannot update this ride',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (ride.status == RideStatus.cancelled) {
      throw new HttpException(
        'Ride has been Canceled',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      id,
      req.user.id,
      RideActivity.arrivedForPickup,
    );
    //  notify user of arrival for pickup
    this.rideGateway.server
      .to(ride.user.websocketId)
      .emit('riderHasArrived', rideActivity);
    return rideActivity;
  }

  @Patch('rides/:id/start')
  async startRide(@Req() req, @Param('id') id: string) {
    const ride = await this.ridesService.findOneForRider(req.user.id, id);
    if (!ride || !ride.vehicle || ride.vehicle.userId !== req.user.id) {
      throw new HttpException(
        'You cannot start this ride',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (ride.status == RideStatus.cancelled) {
      throw new HttpException(
        'Ride has been Canceled',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      id,
      req.user.id,
      RideActivity.startedRide,
    );
    //  notify user of ride started
    this.rideGateway.server
      .to(ride.user.websocketId)
      .emit('rideStarted', rideActivity);

    return rideActivity;
  }
}
