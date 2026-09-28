import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'COP' }) @IsOptional() @IsString() @MaxLength(10) currency?: string;
  @ApiPropertyOptional({ example: 'America/Bogota' }) @IsOptional() @IsString() timezone?: string;
  @ApiPropertyOptional({ example: '06:00' }) @IsOptional() @IsString() openingTime?: string;
  @ApiPropertyOptional({ example: '22:00' }) @IsOptional() @IsString() closingTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) maxCapacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowCheckinWithoutMembership?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(60) checkinGraceMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) daysBeforeExpiryAlert?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() receiptFooterText?: string;
}
