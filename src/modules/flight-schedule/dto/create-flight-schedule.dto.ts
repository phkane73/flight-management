import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFlightScheduleDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startTimeSchedule: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endTimeSchedule: Date;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}
