import { Module } from '@nestjs/common';
import { FlightRouteService } from './flight-route.service';
import { FlightRouteController } from './flight-route.controller';

@Module({
  controllers: [FlightRouteController],
  providers: [FlightRouteService],
})
export class FlightRouteModule {}
