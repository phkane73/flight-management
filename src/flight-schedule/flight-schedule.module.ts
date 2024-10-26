import { Module } from '@nestjs/common';
import { FlightScheduleService } from './flight-schedule.service';
import { FlightScheduleController } from './flight-schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightSchedule } from 'src/flight-schedule/entity/flight-schedule.entity';

@Module({
  imports:[TypeOrmModule.forFeature([FlightSchedule])],
  controllers: [FlightScheduleController],
  providers: [FlightScheduleService],
  exports:[FlightScheduleService]
})
export class FlightScheduleModule {}
