import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class GenerateFlightDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startFlightScheduleTime: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endFlightScheduleTime: Date;
}
