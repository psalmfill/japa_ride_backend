import { Injectable } from '@nestjs/common';
import {
  Client,
  DistanceMatrixResponse,
  DistanceMatrixResponseData,
  LatLngLiteral,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MapsService extends Client {
  private readonly accessKey = this.config.get('GOOGLE_MAPS_ACCESS_KEY');
  constructor(private config: ConfigService) {
    super();
  }

  async getDistanceMatrix(
    origins: any[],
    destinations: any[],
    travelMode: TravelMode = TravelMode.driving,
    unitSystem: UnitSystem = UnitSystem.metric,
  ) {
    console.log(origins, this.accessKey);
    try {
      const response: DistanceMatrixResponse = await this.distancematrix({
        params: {
          origins,
          destinations,
          // mode: travelMode,
          units: unitSystem,
          key: this.accessKey,
        },
      });
      return response.data.rows[0].elements[0];
    } catch (e) {
      return e;
    }
  }
}
