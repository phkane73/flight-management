import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePlanePositionDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @IsBoolean()
  @IsOptional()
  thePlaneTookOff?: boolean;

  @IsNumber()
  @IsNotEmpty()
  planeId: number;

  @IsNumber()
  @IsNotEmpty()
  airportId: number;
}
