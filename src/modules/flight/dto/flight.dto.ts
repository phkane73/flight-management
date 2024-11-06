import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class FlightDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  departureAirportId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  arrivalAirportId: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  departureTime: Date;
}
