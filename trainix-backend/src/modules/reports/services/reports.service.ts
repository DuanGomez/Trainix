import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Payment } from '../../payments/entities/payment.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { DateRangeDto } from '../../../common/dto/date-range.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Membership) private membershipsRepo: Repository<Membership>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
  ) {}

  async getFinancialReport(gymId: string, { startDate, endDate }: DateRangeDto) {
    const qb = this.paymentsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.member', 'member')
      .leftJoinAndSelect('p.membership', 'membership')
      .leftJoinAndSelect('membership.plan', 'plan')
      .where('p.gym_id = :gymId', { gymId })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED });

    if (startDate) qb.andWhere('p.paid_at >= :startDate', { startDate: startOfDay(new Date(startDate)) });
    if (endDate) qb.andWhere('p.paid_at <= :endDate', { endDate: endOfDay(new Date(endDate)) });

    const payments = await qb.orderBy('p.paidAt', 'DESC').getMany();

    const group = (key: (p: Payment) => string) => {
      const map = new Map<string, { total: number; count: number }>();
      for (const p of payments) {
        const entry = map.get(key(p)) ?? { total: 0, count: 0 };
        entry.total += Number(p.total);
        entry.count += 1;
        map.set(key(p), entry);
      }
      return [...map.entries()].map(([k, v]) => ({ key: k, ...v })).sort((a, b) => b.total - a.total);
    };

    return {
      totalRevenue: payments.reduce((sum, p) => sum + Number(p.total), 0),
      totalPayments: payments.length,
      byMethod: group((p) => p.method).map(({ key, ...v }) => ({ method: key, ...v })),
      byConcept: group((p) => p.concept).map(({ key, ...v }) => ({ concept: key, ...v })),
      dailyTrend: group((p) => format(p.paidAt, 'yyyy-MM-dd'))
        .map(({ key, total }) => ({ date: key, total }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      payments,
    };
  }

  async getMembershipsReport(gymId: string, { startDate, endDate }: DateRangeDto) {
    const qb = this.membershipsRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.member', 'member')
      .leftJoinAndSelect('m.plan', 'plan')
      .where('m.gym_id = :gymId', { gymId });

    if (startDate) qb.andWhere('m.created_at >= :startDate', { startDate: startOfDay(new Date(startDate)) });
    if (endDate) qb.andWhere('m.created_at <= :endDate', { endDate: endOfDay(new Date(endDate)) });

    return qb.orderBy('m.createdAt', 'DESC').getMany();
  }

  async getAttendanceReport(gymId: string, { startDate, endDate }: DateRangeDto) {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.member', 'member')
      .where('a.gym_id = :gymId', { gymId });

    if (startDate) qb.andWhere('a.recorded_at >= :startDate', { startDate: startOfDay(new Date(startDate)) });
    if (endDate) qb.andWhere('a.recorded_at <= :endDate', { endDate: endOfDay(new Date(endDate)) });

    return qb.orderBy('a.recordedAt', 'DESC').getMany();
  }

  async exportFinancialExcel(gymId: string, dateRange: DateRangeDto): Promise<Buffer> {
    const { payments, totalRevenue: total } = await this.getFinancialReport(gymId, dateRange);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Trainix';

    const sheet = workbook.addWorksheet('Reporte Financiero');
    sheet.columns = [
      { header: 'Nº Recibo', key: 'paymentNumber', width: 18 },
      { header: 'Fecha', key: 'paidAt', width: 20 },
      { header: 'Cliente', key: 'member', width: 30 },
      { header: 'Concepto', key: 'concept', width: 20 },
      { header: 'Método', key: 'method', width: 15 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Descuento', key: 'discount', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    sheet.getRow(1).font = { bold: true };

    payments.forEach((p) => {
      sheet.addRow({
        paymentNumber: p.paymentNumber,
        paidAt: p.paidAt,
        member: p.member ? `${p.member.firstName} ${p.member.lastName}` : '',
        concept: p.concept,
        method: p.method,
        amount: Number(p.amount),
        discount: Number(p.discount),
        total: Number(p.total),
      });
    });

    sheet.addRow({});
    sheet.addRow({ concept: 'TOTAL', total });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}
