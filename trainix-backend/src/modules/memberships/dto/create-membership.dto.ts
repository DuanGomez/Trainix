import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembershipDto {
  @ApiProperty({ description: 'ID, código (TX-0001) o documento del cliente' })
  @IsString() @IsNotEmpty()
  memberId: string;

  @ApiProperty()
  @IsUUID()
  planId: string;

  @ApiProperty({ example: '2026-06-14' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: 120000 })
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  pricePaid: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
