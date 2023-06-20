import { VehicleCategoriesService } from './../services/vehicle-categories.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { CreateCityDto } from 'src/dto/create-city.dto';
import { CreateConfigDto } from 'src/dto/create-config.dto';
import { CreateCountryDto } from 'src/dto/create-country.dto';
import { CreateCurrencyDto } from 'src/dto/create-currency.dto';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { CreateStateDto } from 'src/dto/create-state.dto';
import { CreateVehicleCategoryDto } from 'src/dto/create-vehicle-category.dto';
import { UpdateCityDto } from 'src/dto/update-city.dto';
import { UpdateCountryDto } from 'src/dto/update-country.dto';
import { UpdateStateDto } from 'src/dto/update-state.dto';
import { UpdateVehicleCategoryDto } from 'src/dto/update-vehicle-category.dto';
import { ConfigsService } from 'src/services/configs.service';
import { CurrenciesService } from 'src/services/currencies.service';
import { LocationsService } from 'src/services/locations.service';
import { RolesService } from 'src/services/roles.service';
import { UsersService } from 'src/users/users.service';

@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
    private readonly currenciesService: CurrenciesService,
    private readonly configsService: ConfigsService,
    private readonly vehicleCategoriesService: VehicleCategoriesService,
    private readonly rolesService: RolesService,
  ) {}

  @Post('configs')
  createConfig(@Body() createConfigDto: CreateConfigDto) {
    return this.configsService.create(createConfigDto);
  }

  @Get('configs')
  async findAllConfigs() {
    return await this.configsService.findAll();
  }

  @Get('configs/:id')
  findOneConfig(@Param('id') id: string) {
    return this.configsService.findOne(id);
  }

  @Patch('configs/:id')
  updateConfig(
    @Param('id') id: string,
    @Body() updateConfigDto: CreateConfigDto,
  ) {
    return this.configsService.update(id, updateConfigDto);
  }

  @Delete('configs/:id')
  removeConfig(@Param('id') id: string) {
    return this.configsService.remove(id);
  }

  // currency

  @Post('currencies')
  createCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Get('currencies')
  async findAllCurrencies() {
    return await this.currenciesService.findAll();
  }

  @Get('currencies/:id')
  findOneCurrency(@Param('id') id: string) {
    return this.currenciesService.findOne(id);
  }

  @Patch('currencies/:id')
  updateCurrency(
    @Param('id') id: string,
    @Body() updateCurrencyDto: CreateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Delete('currencies/:id')
  removeCurrency(@Param('id') id: string) {
    return this.currenciesService.remove(id);
  }

  // Locations

  @Post('locations/countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationsService.createCountry(createCountryDto);
  }

  @Get('locations/countries')
  async findAllCountries() {
    return await this.locationsService.getCountries();
  }

  @Get('locations/countries/:id')
  findOneCountry(@Param('id') id: string) {
    return this.locationsService.findOneCountry(id);
  }

  @Patch('locations/countries/:id')
  updateCountry(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.locationsService.updateCountry(id, updateCountryDto);
  }

  @Delete('locations/countries/:id')
  removeCountry(@Param('id') id: string) {
    return this.locationsService.removeCountry(id);
  }

  // States

  @Post('locations/countries/:id/states')
  createState(@Param('id') id: string, @Body() createStateDto: CreateStateDto) {
    return this.locationsService.createState(createStateDto);
  }

  @Get('locations/countries/:id/states')
  async findAllStates(@Param('id') id: string) {
    return await this.locationsService.getStates(id);
  }

  @Get('locations/countries/:id/states/:stateId')
  findOneState(@Param('id') id: string, @Param('stateId') stateId: string) {
    return this.locationsService.findOneState(stateId);
  }

  @Patch('locations/countries/:id/states/:stateId')
  updateState(
    @Param('id') id: string,
    @Param('stateId') stateId: string,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    return this.locationsService.updateState(stateId, updateStateDto);
  }

  @Delete('locations/countries/:id/states/:stateId')
  removeState(@Param('id') id: string, @Param('stateId') stateId: string) {
    return this.locationsService.removeState(stateId);
  }

  // cities

  @Post('locations/states/:id/cities')
  createCity(@Param('id') id: string, @Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }

  @Get('locations/states/:id/cities')
  async findAllCities(@Param('id') id: string) {
    return await this.locationsService.getCities(id);
  }

  @Get('locations/states/:id/cities/:cityId')
  findOneCity(@Param('id') id: string, @Param('cityId') cityId: string) {
    return this.locationsService.findOneState(cityId);
  }

  @Patch('locations/states/:id/cities/:cityId')
  updateCity(
    @Param('id') id: string,
    @Param('cityId') cityId: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.locationsService.updateCity(cityId, updateCityDto);
  }

  @Delete('locations/states/:id/cities/:cityId')
  removeCity(@Param('id') id: string, @Param('cityId') cityId: string) {
    return this.locationsService.removeCity(cityId);
  }

  // vehicle categories

  @Post('vehicle-categories')
  createVehicleCategory(
    @Body() createVehicleCategoryDto: CreateVehicleCategoryDto,
  ) {
    return this.vehicleCategoriesService.create(createVehicleCategoryDto);
  }

  @Get('vehicle-categories')
  async findAllVehicleCategories() {
    return await this.vehicleCategoriesService.findAll();
  }

  @Get('vehicle-categories/:id')
  findOneVehicleCategory(@Param('id') id: string) {
    return this.vehicleCategoriesService.findOne(id);
  }

  @Patch('vehicle-categories/:id')
  updateVehicleCategory(
    @Param('id') id: string,
    @Body() updateVehicleCategoryDto: UpdateVehicleCategoryDto,
  ) {
    return this.vehicleCategoriesService.update(id, updateVehicleCategoryDto);
  }

  @Delete('vehicle-categories/:id')
  removeVehicleCategory(@Param('id') id: string) {
    return this.vehicleCategoriesService.remove(id);
  }

  //  roles and permissions
  @Get('permission')
  getPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get('roles')
  async findAllRoles() {
    return await this.rolesService.findAll();
  }

  @Get('roles/:id')
  findOneRole(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: CreateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete('roles/:id')
  removeRole(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
