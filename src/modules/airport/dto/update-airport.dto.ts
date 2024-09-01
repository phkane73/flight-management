import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAirportDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsString()
  airportCode?: string;

  @IsOptional()
  @IsString()
  airportName?: string;

  @IsOptional()
  @IsString()
  airportLocation?: string;

  @IsOptional()
  @IsBoolean()
  isOperating?: boolean;

  @IsOptional()
  @IsNumber()
  maxLoad?: number;
}
