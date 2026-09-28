import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { Payment } from './entities/payment.entity';
import { Member } from '../members/entities/member.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { CashSession } from '../cash-register/entities/cash-session.entity';
import { CashMovement } from '../cash-register/entities/cash-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Member, Membership, CashSession, CashMovement])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
