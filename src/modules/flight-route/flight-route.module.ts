import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from 'src/modules/airport/airport.module';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { FlightRouteController } from './flight-route.controller';
import { FlightRouteService } from './flight-route.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlightRoute]), AirportModule],
  controllers: [FlightRouteController],
  providers: [FlightRouteService],
  exports: [FlightRouteService],
})
export class FlightRouteModule {}
