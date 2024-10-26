import { Body, Controller, Post } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { Flight } from 'src/modules/flight/entity/flight.entity';
import { FlightService } from './flight.service';
import { GenerateFlightDto } from 'src/modules/flight/dto/generate-flight.dto';

@Controller('flight')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}
  @Post('generate')
  generateFlights(@Body() generateFlightDto: GenerateFlightDto): Promise<Response<Flight[]>> {
    return this.flightService.generateFlights(generateFlightDto);
  }
}
