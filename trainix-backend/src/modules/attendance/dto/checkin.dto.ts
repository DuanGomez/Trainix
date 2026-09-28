import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckinDto {
  @ApiProperty({ description: 'Código TX, documento o UUID del miembro', example: 'TX-0001' })
  @IsString() @IsNotEmpty()
  query: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
