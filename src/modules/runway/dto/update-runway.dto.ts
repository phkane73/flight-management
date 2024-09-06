import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';

export class UpdateRunwayDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  runwayCode?: string;

  @IsOptional()
  @IsEnum(RunwayTypeEnum)
  runwayType?: RunwayTypeEnum;

  @IsOptional()
  @Type(() => Date)
  availableTime?: Date;

  @IsOptional()
  @IsBoolean()
  isOperating?: boolean;

  @IsOptional()
  @IsNumber()
  airportId?: number;
}
