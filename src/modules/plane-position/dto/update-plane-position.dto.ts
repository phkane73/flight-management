import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdatePlanePositionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startTime?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @IsBoolean()
  @IsOptional()
  thePlaneTookOff?: boolean;

  @IsNumber()
  @IsOptional()
  planeId?: number;

  @IsNumber()
  @IsOptional()
  airportId?: number;
}
