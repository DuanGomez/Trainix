import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGymDto {
  @ApiProperty({ example: 'Trainix Centro' })
  @IsString() @IsNotEmpty() @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'trainix-centro' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  slug: string;

  @ApiPropertyOptional() @IsOptional() @IsString() nit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
}
