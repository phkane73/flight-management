import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { CreateFlightRouteDto } from 'src/modules/flight-route/dto/create-flight-route.dto';
import { UpdateFlightRouteDto } from 'src/modules/flight-route/dto/update-flight-route.dto';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { FlightRouteService } from './flight-route.service';

@Controller('flight-route')
export class FlightRouteController {
  constructor(private readonly flightRouteService: FlightRouteService) {}

  @Post('create')
  addFlightRoute(
    @Body() createFlightRouteDto: CreateFlightRouteDto,
  ): Promise<Response<FlightRoute>> {
    return this.flightRouteService.addFlightRoute(createFlightRouteDto);
  }

  @Patch('update')
  updateFlightRoute(
    @Body() updateFlightRouteDto: UpdateFlightRouteDto,
  ): Promise<Response<FlightRoute>> {
    return this.flightRouteService.updateFlightRoute(updateFlightRouteDto);
  }

  @Get('get/:id')
  getFlightRoute(@Param('id') id: number) {
    return this.flightRouteService.getFlightRouteById(id);
  }

  @Get('get-all')
  getAllFlightRoute() {
    return this.flightRouteService.getAllFlightRoute();
  }

  @Delete('delete/:id')
  removeFlightRoute(@Param('id') id: number): Promise<Response<FlightRoute>> {
    return this.flightRouteService.deleteFlightRoute(id);
  }
}
