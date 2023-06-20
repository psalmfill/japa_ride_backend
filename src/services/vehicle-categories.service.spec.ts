import { Test, TestingModule } from '@nestjs/testing';
import { VehicleCategoriesService } from './vehicle-categories.service';

describe('VehicleCategoriesService', () => {
  let service: VehicleCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleCategoriesService],
    }).compile();

    service = module.get<VehicleCategoriesService>(VehicleCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
