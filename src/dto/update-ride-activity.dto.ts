import { PartialType } from '@nestjs/mapped-types';
import { CreateRideActivityDto } from './create-ride-activity.dto';

export class UpdateRideActivityDto extends PartialType(CreateRideActivityDto) {}
