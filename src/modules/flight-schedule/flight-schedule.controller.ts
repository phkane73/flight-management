import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Pagination } from 'src/common/interface/pagination.interface';
import { SearchFlightScheduleDto } from 'src/modules/flight-schedule/dto/search-flight-schedule.dto';
import { FlightSchedule } from 'src/modules/flight-schedule/entity/flight-schedule.entity';
import { FlightScheduleService } from './flight-schedule.service';
import { Response } from 'src/common/interface/error.interface';

@Controller('flight-schedule')
export class FlightScheduleController {
  constructor(private readonly flightScheduleService: FlightScheduleService) {}

  @Get('get-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllFlightSchedule(
    @Query() searchFlightScheduleDto: SearchFlightScheduleDto,
  ): Promise<Pagination<FlightSchedule>> {
    return this.flightScheduleService.getAllFlightSchedule(searchFlightScheduleDto);
  }

  @Delete('delete/:id')
  deleteFlightSchedule(@Param('id') id: number) {
    return this.flightScheduleService.deleteFlightSchedule(id);
  }

  @Get('check-approve/:id')
  checkApprove(@Param('id') id: number) {
    return this.flightScheduleService.checkApprove(id);
  }
}
