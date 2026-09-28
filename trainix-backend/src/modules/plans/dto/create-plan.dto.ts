import {
  IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanDuration } from '../entities/plan.entity';

export class CreatePlanDto {
  @ApiProperty({ example: 'Mensual Estándar' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ enum: PlanDuration })
  @IsEnum(PlanDuration)
  duration: PlanDuration;

  @ApiProperty({ example: 30 })
  @IsInt() @Min(1)
  durationDays: number;

  @ApiProperty({ example: 120000 })
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  price: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsInt() @Min(0)
  maxFreezes?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  allowsGuest?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  includesClasses?: boolean;

  @ApiPropertyOptional({ example: '#1976D2' })
  @IsOptional() @IsString()
  color?: string;
}
