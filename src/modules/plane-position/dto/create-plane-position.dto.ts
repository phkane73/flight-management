import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePlanePositionDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @IsNumber()
  @IsNotEmpty()
  planeId: number;

  @IsNumber()
  @IsNotEmpty()
  airportId: number;
}
