import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloseSessionDto {
  @ApiProperty({ description: 'Efectivo contado al cierre' })
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  closingAmount: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
