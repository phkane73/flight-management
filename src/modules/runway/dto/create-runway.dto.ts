import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';

export class CreateRunwayDto {
  @IsString()
  @IsNotEmpty()
  runwayCode: string;

  @IsEnum(RunwayTypeEnum)
  @IsNotEmpty()
  runwayType: RunwayTypeEnum;

  @IsOptional()
  availableTime?: Date;

  @IsBoolean()
  @IsNotEmpty()
  isOperating: boolean;

  @IsNumber()
  @IsNotEmpty()
  airportId: number;
}
