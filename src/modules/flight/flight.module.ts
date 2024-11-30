import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from 'src/modules/airport/airport.module';
import { FlightRouteModule } from 'src/modules/flight-route/flight-route.module';
import { FlightScheduleModule } from 'src/modules/flight-schedule/flight-schedule.module';
import { Flight } from 'src/modules/flight/entity/flight.entity';
import { PlanePositionModule } from 'src/modules/plane-position/plane-position.module';
import { PlaneModule } from 'src/modules/plane/plane.module';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { RunwayModule } from 'src/modules/runway/runway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Flight]),
    FlightRouteModule,
    PlaneModule,
    PlanePositionModule,
    AirportModule,
    FlightScheduleModule,
    RunwayModule
  ],
  controllers: [FlightController],
  providers: [FlightService],
})
export class FlightModule {}
