import {
  IsArray, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, IsUUID, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '../entities/exercise.entity';
import { WeekDay } from '../entities/routine-day.entity';

export class RoutineExerciseDto {
  @ApiProperty() @IsUUID() exerciseId: string;
  @ApiPropertyOptional({ default: 3 }) @IsOptional() @IsInt() @Min(1) sets?: number;
  @ApiPropertyOptional({ default: '10' }) @IsOptional() @IsString() reps?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() weight?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) restSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) durationSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) orderIndex?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class RoutineDayDto {
  @ApiProperty({ enum: WeekDay }) @IsEnum(WeekDay) day: WeekDay;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) label?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() orderIndex?: number;
  @ApiPropertyOptional({ type: [RoutineExerciseDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => RoutineExerciseDto)
  exercises?: RoutineExerciseDto[];
}

export class CreateRoutineDto {
  @ApiProperty({ description: 'ID, código (TX-0001) o documento del cliente' }) @IsString() @IsNotEmpty() memberId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() trainerId?: string;
  @ApiProperty({ example: 'Fuerza + Hipertrofia' }) @IsString() @IsNotEmpty() @MaxLength(150) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() objective?: string;
  @ApiPropertyOptional({ enum: Difficulty }) @IsOptional() @IsEnum(Difficulty) difficulty?: Difficulty;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) durationWeeks?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: [RoutineDayDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => RoutineDayDto)
  days?: RoutineDayDto[];
}
