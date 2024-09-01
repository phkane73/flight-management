import { Controller } from '@nestjs/common';
import { FlightRouteService } from './flight-route.service';

@Controller('flight-route')
export class FlightRouteController {
  constructor(private readonly flightRouteService: FlightRouteService) {}
}
