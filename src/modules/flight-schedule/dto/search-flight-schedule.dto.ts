import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SearchFlightScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  limit: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startTimeSchedule?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTimeSchedule?: Date;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}
