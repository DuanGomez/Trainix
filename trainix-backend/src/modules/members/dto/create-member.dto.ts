import {
  IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional,
  IsString, MaxLength, Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { DocumentType, Gender, BloodType } from '../entities/member.entity';

export class CreateMemberDto {
  @ApiProperty({ example: 'Carlos' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ enum: DocumentType, default: DocumentType.CC })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ example: '1023456789' })
  @IsString() @IsNotEmpty()
  @Matches(/^[0-9A-Za-z\-]{4,20}$/, { message: 'Número de documento inválido' })
  documentNumber: string;

  @ApiPropertyOptional({ example: 'carlos@email.com' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: '1995-06-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: BloodType })
  @IsOptional() @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(150)
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(20)
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  healthNotes?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  objective?: string;
}
