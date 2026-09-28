import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { Payment } from '../payments/entities/payment.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Membership, Attendance])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
