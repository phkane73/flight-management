import { Module } from '@nestjs/common';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from 'src/modules/flight/entity/flight.entity';
import { FlightRouteModule } from 'src/modules/flight-route/flight-route.module';
import { PlaneModule } from 'src/modules/plane/plane.module';
import { PlanePositionModule } from 'src/modules/plane-position/plane-position.module';
import { AirportModule } from 'src/modules/airport/airport.module';

@Module({
  imports:[TypeOrmModule.forFeature([Flight]), FlightRouteModule, PlaneModule, PlanePositionModule, AirportModule],
  controllers: [FlightController],
  providers: [FlightService],
})
export class FlightModule {}
