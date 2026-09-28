import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Member } from '../../members/entities/member.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { CashSession, CashSessionStatus } from '../../cash-register/entities/cash-session.entity';
import { MembershipStatus } from '../../../common/enums/membership-status.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { AttendanceType } from '../../../common/enums/attendance-type.enum';

export interface ChartPoint { label: string; value: number; }

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Member) private membersRepo: Repository<Member>,
    @InjectRepository(Membership) private membershipsRepo: Repository<Membership>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(CashSession) private cashSessionsRepo: Repository<CashSession>,
  ) {}

  async getSummary(gymId: string) {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    const [
      totalMembers,
      activeMembers,
      newMembersMonth,
      expiringMemberships,
      todayAttendance,
      todayRevenue,
      monthRevenue,
      openCashSession,
    ] = await Promise.all([
      this.membersRepo.count({ where: { gymId } }),
      this.membersRepo.count({ where: { gymId, isActive: true } }),
      this.membersRepo
        .createQueryBuilder('m')
        .where('m.gym_id = :gymId', { gymId })
        .andWhere('m.joined_at BETWEEN :start AND :end', {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        })
        .getCount(),
      this.membershipsRepo
        .createQueryBuilder('m')
        .where('m.gym_id = :gymId', { gymId })
        .andWhere('m.status = :status', { status: MembershipStatus.ACTIVE })
        .andWhere('m.end_date BETWEEN :today AND :limit', { today, limit: format(addDays(now, 7), 'yyyy-MM-dd') })
        .getCount(),
      this.countCheckins(gymId, startOfDay(now), endOfDay(now)),
      this.sumRevenue(gymId, startOfDay(now), endOfDay(now)),
      this.sumRevenue(gymId, startOfMonth(now), endOfMonth(now)),
      this.cashSessionsRepo.exists({ where: { gymId, status: CashSessionStatus.OPEN } }),
    ]);

    return {
      totalMembers,
      activeMembers,
      todayAttendance,
      todayRevenue,
      expiringMemberships,
      monthRevenue,
      newMembersMonth,
      openCashSession,
    };
  }

  async getRevenueChart(gymId: string): Promise<ChartPoint[]> {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    return Promise.all(
      months.map(async (month) => ({
        label: format(month, 'MMM', { locale: es }),
        value: await this.sumRevenue(gymId, startOfMonth(month), endOfMonth(month)),
      })),
    );
  }

  async getAttendanceChart(gymId: string): Promise<ChartPoint[]> {
    const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6));
    return Promise.all(
      days.map(async (day) => ({
        label: format(day, 'EEE dd', { locale: es }),
        value: await this.countCheckins(gymId, startOfDay(day), endOfDay(day)),
      })),
    );
  }

  private countCheckins(gymId: string, start: Date, end: Date) {
    return this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.gym_id = :gymId', { gymId })
      .andWhere('a.type = :type', { type: AttendanceType.CHECKIN })
      .andWhere('a.recorded_at BETWEEN :start AND :end', { start, end })
      .getCount();
  }

  private async sumRevenue(gymId: string, start: Date, end: Date): Promise<number> {
    const result = await this.paymentsRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.total), 0)', 'total')
      .where('p.gym_id = :gymId', { gymId })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.paid_at BETWEEN :start AND :end', { start, end })
      .getRawOne();
    return Number(result?.total ?? 0);
  }
}
