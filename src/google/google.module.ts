import { Module } from '@nestjs/common';
import { MapsService } from './services/maps.service';

@Module({
  providers: [MapsService],
  exports: [MapsService],
})
export class GoogleModule {}
