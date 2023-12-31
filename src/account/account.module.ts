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
import { RiderController } from './rider.controller';
import { PaymentsService } from 'src/services/payments.service';
import { RideGateway } from 'src/gateways/ride.gateway';
import { TransactionsService } from 'src/services/transactions.service';
import { PaystackModule } from 'src/paystack/paystack.module';
import { GoogleModule } from 'src/google/google.module';

@Module({
  imports: [AuthModule, PaystackModule, GoogleModule],
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
    PaymentsService,
    RideGateway,
    TransactionsService,
  ],
  controllers: [AccountController, AdminController, RiderController],
})
export class AccountModule {}
