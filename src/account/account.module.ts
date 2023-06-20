import { AuthModule } from './../auth/auth.module';
import { AuthService } from './../auth/auth.service';
import { PrismaService } from './../prisma/prisma.service';
import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AdminController } from './admin.controller';
import { LocationsService } from 'src/services/locations.service';
import { RolesService } from 'src/services/roles.service';
import { RidesService } from 'src/services/rides.service';
import { VehicleCategoriesService } from 'src/services/vehicle-categories.service';
import { VehiclesService } from 'src/services/vehicles.service';
import { CurrenciesService } from 'src/services/currencies.service';
import { ConfigsService } from 'src/services/configs.service';

@Module({
  imports: [AuthModule],
  providers: [
    AccountService,
    UsersService,
    PrismaService,
    LocationsService,
    RolesService,
    RidesService,
    VehicleCategoriesService,
    VehiclesService,
    CurrenciesService,
    ConfigsService,
  ],
  controllers: [AccountController, AdminController],
})
export class AccountModule {}
