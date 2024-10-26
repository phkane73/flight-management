import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class MovePlaneDto {
  @IsNumber()
  planeId: number;

  @IsNumber()
  airportId: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  takeOffTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTimeFlightSchedule?: Date;
}
