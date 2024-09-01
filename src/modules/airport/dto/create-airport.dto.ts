import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAirportDto {
  @IsString()
  @IsNotEmpty()
  airportCode: string;

  @IsString()
  @IsNotEmpty()
  airportName: string;

  @IsString()
  @IsNotEmpty()
  airportLocation: string;

  @IsBoolean()
  @IsNotEmpty()
  isOperating: boolean;

  @IsNumber()
  @IsNotEmpty()
  maxLoad: number;
}
