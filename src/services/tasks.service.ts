import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RideActivity, RidesService } from './rides.service';
import { RideStatus } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { VehiclesService } from './vehicles.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly ridesService: RidesService,
    private readonly usersService: UsersService,
    private readonly vehiclesService: VehiclesService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  async findDriverForPendingRides() {
    //  get pending rides
    const rides = await this.ridesService.findManyByStatus(RideStatus.pending);

    for (let ride of rides) {
      //   check if the ride has been assign a vehicle already
      if (ride.vehicleId) continue;
      // get online driver within user range
      const driver = await this.usersService.findRiderWithinRange(
        ride.pickupLatitude.toNumber(),
        ride.pickupLongitude.toNumber(),
        30,
      );
      // if a driver is found assign to the user
      if (driver) {
        //  get the vehicle
        const vehicle = await this.vehiclesService.findRiderVehicle(driver.id);
        if (vehicle) {
          //  assign vehicle to ride and notify the user
          await this.ridesService.update(ride.id, {
            vehicleId: vehicle.id,
          });
          //  create activity
          await this.ridesService.updateRideActivity(
            ride.id,
            driver.id,
            RideActivity.riderAssigned,
          );
          // todo notify driver of pickup assignment via websocket

          // todo notify user of assigned vehicle via websocket
        }
      }
    }
  }
}
