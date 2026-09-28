import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'Juan' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'García' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ example: 'juan.garcia@trainix.app' })
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: 'Trainix2024!', minLength: 8 })
  @IsString() @MinLength(8)
  password: string;

  @ApiProperty({ description: 'UUID del rol asignado' })
  @IsUUID()
  roleId: string;
}
