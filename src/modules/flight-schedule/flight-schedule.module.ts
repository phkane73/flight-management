import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightSchedule } from 'src/modules/flight-schedule/entity/flight-schedule.entity';
import { FlightScheduleController } from './flight-schedule.controller';
import { FlightScheduleService } from './flight-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlightSchedule])],
  controllers: [FlightScheduleController],
  providers: [FlightScheduleService],
  exports: [FlightScheduleService],
})
export class FlightScheduleModule {}
