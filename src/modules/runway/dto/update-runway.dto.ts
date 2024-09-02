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
  availableTime?: Date;

  @IsOptional()
  @IsBoolean()
  isOperating?: boolean;

  @IsOptional()
  @IsNumber()
  airportId?: number;
}
