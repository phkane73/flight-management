import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlaneDto {
  @IsString()
  @IsNotEmpty()
  planeName: string;

  @IsBoolean()
  @IsNotEmpty()
  isOperating: boolean;
}
