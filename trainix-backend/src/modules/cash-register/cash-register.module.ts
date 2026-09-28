import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashRegisterController } from './controllers/cash-register.controller';
import { CashRegisterService } from './services/cash-register.service';
import { CashSession } from './entities/cash-session.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashSession, CashMovement, Payment])],
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
  exports: [CashRegisterService, TypeOrmModule],
})
export class CashRegisterModule {}
