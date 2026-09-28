import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { Member } from '../members/entities/member.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CashSession } from '../cash-register/entities/cash-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Membership, Attendance, Payment, CashSession])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
