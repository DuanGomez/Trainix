import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { Attendance } from './entities/attendance.entity';
import { Member } from '../members/entities/member.entity';
import { Membership } from '../memberships/entities/membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Member, Membership])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService, TypeOrmModule],
})
export class AttendanceModule {}
