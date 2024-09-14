import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { FlightRouteController } from './flight-route.controller';
import { FlightRouteService } from './flight-route.service';
import { AirportModule } from 'src/modules/airport/airport.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlightRoute]), AirportModule],
  controllers: [FlightRouteController],
  providers: [FlightRouteService],
})
export class FlightRouteModule {}
