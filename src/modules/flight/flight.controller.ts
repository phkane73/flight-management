import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { FlightDto } from 'src/modules/flight/dto/flight.dto';
import { GenerateFlightDto } from 'src/modules/flight/dto/generate-flight.dto';
import { Flight } from 'src/modules/flight/entity/flight.entity';
import { FlightService } from './flight.service';

@Controller('flight')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}
  @Post('generate')
  generateFlights(@Body() generateFlightDto: GenerateFlightDto): Promise<Response<Flight[]>> {
    return this.flightService.generateFlights(generateFlightDto);
  }

  @Get('get-by-flight-schedule-id/:id')
  getAllFlightByFlightScheduleId(@Param('id') id: number): Promise<Flight[]> {
    return this.flightService.getAllFlightByFlightScheduleId(id);
  }

  @Get('check-flight-exist')
  @UsePipes(new ValidationPipe({ transform: true }))
  checkFlightIsExist(@Query() flightDto: FlightDto): Promise<Flight> {
    return this.flightService.checkFlightIsExist(flightDto);
  }

  @Get('find-flights/:id')
  findFlights(@Param('id') id: number): Promise<{ data: Flight[]; price: string }> {
    return this.flightService.findFlights(id);
  }
}
