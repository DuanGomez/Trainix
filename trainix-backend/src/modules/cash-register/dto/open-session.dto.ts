import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenSessionDto {
  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  openingAmount?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
