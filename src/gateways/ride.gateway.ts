import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { RideStatus, User } from '@prisma/client';
import { Server } from 'socket.io';
import { WsGuard } from 'src/auth/guards/ws-guard';
import { RideActivity, RidesService } from 'src/services/rides.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway()
export class RideGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly ridesService: RidesService,
  ) {}

  @WebSocketServer()
  server: Server;
  @UseGuards(WsGuard)
  @SubscribeMessage('cancelRide')
  async handleCancelRide(
    client: any,
    payload: { rideId: string; user?: User },
  ) {
    return 'Hello world!';
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('declineRide')
  async handleDeclineRide(client: any, data: { rideId: string; user?: User }) {
    const ride = await this.ridesService.findOneForRider(
      data.user.id,
      data.rideId,
    );
    if (!ride || !ride.vehicle || ride.vehicle.userId !== data.user.id) {
      throw new WsException('You cannot decline this ride');
    }

    if (ride.status == RideStatus.cancelled) {
      throw new WsException('Ride has been Canceled');
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      ride.id,
      data.user.id,
      RideActivity.declinedRide,
    );
    //   update the ride
    await this.ridesService.update(ride.id, {
      vehicleId: null,
    });
    // todo notify user of decline ride

    //   todo find the nearest ride

    return rideActivity;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('acceptRide')
  async handleAcceptRide(client: any, data: { rideId: string; user?: User }) {
    const ride = await this.ridesService.findOneForRider(
      data.user.id,
      data.rideId,
    );
    if (!ride || !ride.vehicle || ride.vehicle.userId !== data.user.id) {
      throw new WsException('You cannot accept this ride');
    }

    if (ride.status == RideStatus.cancelled) {
      throw new WsException('Ride has been Canceled');
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      ride.id,
      data.user.id,
      RideActivity.acceptedRide,
    );
    //   update the ride
    await this.ridesService.update(ride.id, {
      vehicleId: RideStatus.inProgress,
    });
    // todo notify user of accepted ride

    return rideActivity;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('arriveForPickup')
  async handleArriveForPickup(
    client: any,
    data: { rideId: string; user?: User },
  ) {
    const ride = await this.ridesService.findOneForRider(
      data.user.id,
      data.rideId,
    );
    if (!ride || !ride.vehicle || ride.vehicle.userId !== data.user.id) {
      throw new WsException('You cannot update this ride');
    }

    if (ride.status == RideStatus.cancelled) {
      throw new WsException('Ride has been Canceled');
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      ride.id,
      data.user.id,
      RideActivity.arrivedForPickup,
    );
    // todo notify user of arrival for pickup

    return rideActivity;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('startRide')
  async handleStartRide(client: any, data: { rideId: string; user?: User }) {
    const ride = await this.ridesService.findOneForRider(
      data.user.id,
      data.rideId,
    );
    if (!ride || !ride.vehicle || ride.vehicle.userId !== data.user.id) {
      throw new WsException('You cannot start this ride');
    }

    if (ride.status == RideStatus.cancelled) {
      throw new WsException('Ride has been Canceled');
    }
    //   create a decline record for the ride
    const rideActivity = await this.ridesService.updateRideActivity(
      ride.id,
      data.user.id,
      RideActivity.startedRide,
    );
    // todo notify user of arrival for pickup

    return rideActivity;
  }
}
