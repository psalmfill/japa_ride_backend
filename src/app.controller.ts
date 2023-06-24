import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrenciesService } from './services/currencies.service';
import { PaymentsService } from './services/payments.service';
import { VehicleCategoriesService } from './services/vehicle-categories.service';
import { ConfigsService } from './services/configs.service';
import { LocationsService } from './services/locations.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly vehicleCategoriesService: VehicleCategoriesService,
    private readonly currenciesService: CurrenciesService,
    private readonly paymentsService: PaymentsService,
    private readonly locationsService: LocationsService,
    private readonly configsService: ConfigsService,
  ) {}
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
}
