import { getDistance } from 'src/helpers';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CurrenciesService } from './services/currencies.service';
import { PaymentsService } from './services/payments.service';
import { VehicleCategoriesService } from './services/vehicle-categories.service';
import { ConfigsService } from './services/configs.service';
import { LocationsService } from './services/locations.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaystackWebHookGuard } from './paystack/guards/paystack-webhook-guard';
import {
  PaystackEvents,
  PaystackService,
  PaystackTransaction,
  PaystackTransactionResponse,
} from './paystack/paystack.service';
import { TransactionsService } from './services/transactions.service';
import { PaymentStatus, TransactionStatus } from '@prisma/client';
import { MapsService } from './google/services/maps.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly vehicleCategoriesService: VehicleCategoriesService,
    private readonly currenciesService: CurrenciesService,
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
    private readonly locationsService: LocationsService,
    private readonly configsService: ConfigsService,
    private configService: ConfigService,
    private paystackService: PaystackService,
    private mapService: MapsService,
  ) {}

  @Get('')
  getDistance() {
    return this.mapService.getDistanceMatrix(
      ['Ibom plaza, uyo, akwa ibom, nigeria'],
      ['University of uyo, uyo, akwa ibom, Nigeria'],
    );
  }

  @UseGuards(PaystackWebHookGuard)
  @Post('paystack-webhook')
  async paystackWebhook(@Req() req, @Body() payload) {
    if (
      payload.event == PaystackEvents.chargeSuccess ||
      payload.event == PaystackEvents.paymentRequestSuccess ||
      payload.event == PaystackEvents.transferSuccess
    ) {
      const data: PaystackTransaction = payload.data;
      // get the payment
      const payment = await this.paymentsService.findOneByReference(
        data.reference,
      );
      if (payment) {
        // update the payment
        await this.paymentsService.update(payment.id, {
          status: PaymentStatus.completed,
        });

        if (payment.transactionId) {
          // confirm thee transaction
          await this.transactionsService.update(payment.transactionId, {
            status: TransactionStatus.completed,
          });
        }
        return;
      }
    } else if (
      payload.event == PaystackEvents.transferReversed ||
      payload.event == PaystackEvents.transferFailed
    ) {
      const data: PaystackTransaction = payload.data;
      // get the payment
      const payment = await this.paymentsService.findOneByReference(
        data.reference,
      );
      if (payment) {
        // update the payment
        await this.paymentsService.update(payment.id, {
          status: PaymentStatus.failed,
        });

        if (payment.transactionId) {
          // confirm thee transaction
          await this.transactionsService.update(payment.transactionId, {
            status: TransactionStatus.failed,
          });
        }
      }
      return;
    }
    return;
  }

  @Get('paystack-callback')
  async paystackCallback(@Req() req, @Query() query) {
    const response: PaystackTransactionResponse =
      await this.paystackService.verifyTransaction(query.reference);
    if (response.status) {
      // find the payment
      const payment = await this.paymentsService.findOneByReference(
        response.data.reference,
      );
      if ((response.data.status = 'success')) {
        const updatedPayment = await this.transactionsService.update(
          payment.transactionId,
          {
            status: TransactionStatus.completed,
          },
        );
        if (payment.transactionId) {
          // confirm thee transaction
          await this.transactionsService.update(payment.transactionId, {
            status: TransactionStatus.completed,
          });
        }
        return updatedPayment;
      } else if ((response.data.status = 'failed')) {
        const updatedPayment = await this.paymentsService.update(payment.id, {
          status: PaymentStatus.failed,
        });
        if (payment.transactionId) {
          // confirm thee transaction
          await this.transactionsService.update(payment.transactionId, {
            status: TransactionStatus.failed,
          });
        }
        return updatedPayment;
      }
    }
  }
  @Get('configs')
  async findAllConfigs() {
    return await this.configsService.findAll();
  }

  @Get('currencies')
  async findAllCurrencies() {
    return await this.currenciesService.findAll();
  }

  @Get('locations/countries')
  async findAllCountries() {
    return await this.locationsService.getCountries();
  }

  @Get('locations/countries/:id/states')
  async findAllStates(@Param('id') id: string) {
    return await this.locationsService.getStates(id);
  }

  @Get('locations/states/:id/cities')
  async findAllCities(@Param('id') id: string) {
    return await this.locationsService.getCities(id);
  }
  @Get('vehicle-categories')
  async findAllVehicleCategories() {
    return await this.vehicleCategoriesService.findAll();
  }

  @Get('vehicle-categories/:id')
  findOneVehicleCategory(@Param('id') id: string) {
    return this.vehicleCategoriesService.findOne(id);
  }
}
