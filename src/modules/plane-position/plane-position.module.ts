import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from 'src/modules/airport/airport.module';
import { FlightRouteModule } from 'src/modules/flight-route/flight-route.module';
import { PlanePosition } from 'src/modules/plane-position/entity/plane-position.entity';
import { PlaneModule } from 'src/modules/plane/plane.module';
import { PlanePositionController } from './plane-position.controller';
import { PlanePositionService } from './plane-position.service';
import { RunwayModule } from 'src/modules/runway/runway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanePosition]),
    AirportModule,
    PlaneModule,
    FlightRouteModule,
    RunwayModule
  ],
  controllers: [PlanePositionController],
  providers: [PlanePositionService],
  exports: [PlanePositionService],
})
export class PlanePositionModule {}
