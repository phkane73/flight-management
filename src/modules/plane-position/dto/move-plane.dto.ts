import { IsNumber } from "class-validator";

export class MovePlaneDto {
  @IsNumber()
  planeId: number;
  
  @IsNumber()
  airportId: number;
}
