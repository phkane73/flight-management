import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchPlanePositionDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  airportCode?: string;

  @IsOptional()
  @IsString()
  planeName?: string;

  @IsOptional()
  thePlaneTookOff?: boolean;
}
