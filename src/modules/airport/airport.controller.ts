import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { CreateAirportDto } from 'src/modules/airport/dto/create-airport.dto';
import { UpdateAirportDto } from 'src/modules/airport/dto/update-airport.dto';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { AirportService } from './airport.service';

@Controller('airport')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Post('create')
  create(@Body() createAirportDto: CreateAirportDto): Promise<Response<Airport>> {
    return this.airportService.addAirport(createAirportDto);
  }

  @Get('get-all')
  getAllAirport(): Promise<Airport[]> {
    return this.airportService.getAllAirport();
  }

  @Get('get-one/:id')
  getOneAirport(@Param('id') id: number): Promise<Airport> {
    return this.airportService.getOneAirport(id);
  }

  @Put('update')
  update(@Body() updateAirportDto: UpdateAirportDto) {
    return this.airportService.updateAirport(updateAirportDto);
  }
}
