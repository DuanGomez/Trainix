import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@trainix.app' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
