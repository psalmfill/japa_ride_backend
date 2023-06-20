import { ApiProperty } from '@nestjs/swagger';
import { Genders, PaymentMethod, RideStatus } from '@prisma/client';

export class CreateRideDto {
  @ApiProperty()
  vehicleId: string;

  userId: string;

  @ApiProperty()
  pickupLongitude: number;

  @ApiProperty()
  pickupLatitude: number;

  @ApiProperty()
  pickupAddress: string;

  @ApiProperty()
  destinationLongitude: number;

  @ApiProperty()
  destinationLatitude: number;

  @ApiProperty()
  estimatedTime: number;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  currencyId: string;

  @ApiProperty()
  estimatedFee: string;

  @ApiProperty()
  paymentMethod: PaymentMethod;

  status: RideStatus;
}
