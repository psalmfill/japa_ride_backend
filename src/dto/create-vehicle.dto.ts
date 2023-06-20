import { ApiProperty } from '@nestjs/swagger';
import { Genders } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty()
  make: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  plateNumber: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  vehicleCategoryId: string;

  @ApiProperty()
  active?: boolean;
}
