import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateRideActivityDto {
  @ApiProperty()
  rideId: string;

  @ApiProperty()
  activity: string;

  @ApiProperty()
  userId: string;
}
