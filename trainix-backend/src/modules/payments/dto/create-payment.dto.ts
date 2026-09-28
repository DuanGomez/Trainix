import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentConcept } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID, código (TX-0001) o documento del cliente' })
  @IsString() @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  membershipId?: string;

  @ApiProperty({ enum: PaymentConcept, default: PaymentConcept.MEMBERSHIP })
  @IsEnum(PaymentConcept)
  concept: PaymentConcept;

  @ApiProperty({ example: 120000 })
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  discount?: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Número de transacción, voucher, etc.' })
  @IsOptional() @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
