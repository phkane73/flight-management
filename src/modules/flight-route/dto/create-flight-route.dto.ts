import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFlightRouteDto {
  
  @IsNumber()
  @IsNotEmpty()
  flightRouteEstTime: number;

  @IsNotEmpty()
  flightRoutePrice: string;

  @IsNumber()
  @IsNotEmpty()
  departureAirportId: number;

  @IsNumber()
  @IsNotEmpty()
  arrivalAirportId: number;
}
