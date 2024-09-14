import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateFlightRouteDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsOptional()
  flightRouteEstTime?: number;

  @IsOptional()
  flightRoutePrice?: string;

  @IsNumber()
  @IsOptional()
  departureAirportId?: number;

  @IsNumber()
  @IsOptional()
  arrivalAirportId?: number;
}
