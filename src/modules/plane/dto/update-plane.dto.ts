import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlaneDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  planeName?: string;

  @IsBoolean()
  @IsOptional()
  isOperating?: boolean;
}
