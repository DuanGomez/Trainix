import {
  Injectable, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Attendance } from '../entities/attendance.entity';
import { Member } from '../../members/entities/member.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { CheckinDto } from '../dto/checkin.dto';
import { AttendanceType } from '../../../common/enums/attendance-type.enum';
import { MembershipStatus } from '../../../common/enums/membership-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { paginate, getSkip } from '../../../common/utils/pagination.util';
import { findMemberByQuery } from '../../../common/utils/find-member.util';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private repo: Repository<Attendance>,
    @InjectRepository(Member) private membersRepo: Repository<Member>,
    @InjectRepository(Membership) private membershipsRepo: Repository<Membership>,
  ) {}

  async checkin(dto: CheckinDto, gymId: string, recordedBy: string) {
    const member = await findMemberByQuery(this.membersRepo, dto.query, gymId);

    const membership = await this.membershipsRepo.findOne({
      where: { memberId: member.id, gymId, status: MembershipStatus.ACTIVE },
      relations: ['plan'],
    });

    if (!membership) {
      throw new BadRequestException(`${member.fullName} no tiene una membresía activa`);
    }

    if (await this.hasOpenCheckinToday(member.id, gymId)) {
      throw new ConflictException(`${member.fullName} ya tiene un check-in activo hoy`);
    }

    const attendance = await this.repo.save(
      this.repo.create({
        gymId,
        memberId: member.id,
        membershipId: membership.id,
        type: AttendanceType.CHECKIN,
        recordedBy,
        notes: dto.notes,
      }),
    );

    return this.toResult(member, attendance, membership);
  }

  async checkout(dto: CheckinDto, gymId: string, recordedBy: string) {
    const member = await findMemberByQuery(this.membersRepo, dto.query, gymId);

    if (!(await this.hasOpenCheckinToday(member.id, gymId))) {
      throw new BadRequestException(`${member.fullName} no tiene un check-in abierto hoy`);
    }

    const attendance = await this.repo.save(
      this.repo.create({ gymId, memberId: member.id, type: AttendanceType.CHECKOUT, recordedBy, notes: dto.notes }),
    );

    return this.toResult(member, attendance);
  }

  async findAll(gymId: string, query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.member', 'member')
      .where('a.gym_id = :gymId', { gymId });

    if (query.search) {
      qb.andWhere(
        '(member.first_name LIKE :s OR member.last_name LIKE :s OR member.member_code LIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('a.recordedAt', 'DESC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findToday(gymId: string, query: PaginationDto) {
    const now = new Date();
    const qb = this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.member', 'member')
      .where('a.gym_id = :gymId', { gymId })
      .andWhere('a.recorded_at BETWEEN :start AND :end', {
        start: startOfDay(now),
        end: endOfDay(now),
      })
      .orderBy('a.recordedAt', 'DESC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  /** El último registro del día es un check-in sin su check-out. */
  private async hasOpenCheckinToday(memberId: string, gymId: string): Promise<boolean> {
    const last = await this.repo.findOne({
      where: { memberId, gymId },
      order: { recordedAt: 'DESC' },
    });
    return !!last
      && last.type === AttendanceType.CHECKIN
      && format(last.recordedAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  }

  private toResult(member: Member, attendance: Attendance, membership?: Membership) {
    return {
      member: {
        id: member.id,
        memberCode: member.memberCode,
        firstName: member.firstName,
        lastName: member.lastName,
        avatarUrl: member.avatarUrl,
      },
      membership: membership
        ? { status: membership.status, endDate: membership.endDate, plan: { name: membership.plan.name } }
        : undefined,
      attendance: { id: attendance.id, type: attendance.type, recordedAt: attendance.recordedAt },
    };
  }
}
