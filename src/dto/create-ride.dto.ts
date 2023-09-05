import { ApiProperty } from '@nestjs/swagger';
import { Genders, PaymentMethod, RideStatus } from '@prisma/client';

export class CreateRideDto {
  @ApiProperty()
  vehicleCategoryId: string;

  @ApiProperty()
  vehicleId?: string;

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
  estimatedFee: number;

  @ApiProperty()
  destinationAddress: string;

  @ApiProperty()
  paymentMethod: PaymentMethod;

  status: RideStatus;

  paymentStatus?: string;
}
