import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addDays, format, differenceInDays } from 'date-fns';
import { Membership } from '../entities/membership.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { Member } from '../../members/entities/member.entity';
import { findMemberByQuery } from '../../../common/utils/find-member.util';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { MembershipStatus } from '../../../common/enums/membership-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { paginate, getSkip } from '../../../common/utils/pagination.util';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership) private repo: Repository<Membership>,
    @InjectRepository(Plan) private plansRepo: Repository<Plan>,
    @InjectRepository(Member) private membersRepo: Repository<Member>,
  ) {}

  async findAll(gymId: string, query: PaginationDto & { status?: MembershipStatus }) {
    const qb = this.repo.createQueryBuilder('m')
      .leftJoinAndSelect('m.member', 'member')
      .leftJoinAndSelect('m.plan', 'plan')
      .where('m.gym_id = :gymId', { gymId });

    if (query.status) qb.andWhere('m.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(
        '(member.first_name LIKE :s OR member.last_name LIKE :s OR member.member_code LIKE :s OR plan.name LIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('m.endDate', 'ASC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(id: string, gymId: string) {
    const m = await this.repo.findOne({
      where: { id, gymId },
      relations: ['member', 'plan'],
    });
    if (!m) throw new NotFoundException('Membresía no encontrada');
    return m;
  }

  async findActiveMembership(memberId: string, gymId: string) {
    return this.repo.findOne({
      where: { memberId, gymId, status: MembershipStatus.ACTIVE },
      relations: ['plan'],
    });
  }

  async create(dto: CreateMembershipDto, gymId: string, createdBy: string) {
    const member = await findMemberByQuery(this.membersRepo, dto.memberId, gymId);
    const active = await this.findActiveMembership(member.id, gymId);
    if (active) throw new ConflictException('El cliente ya tiene una membresía activa');

    const plan = await this.plansRepo.findOneBy({ id: dto.planId, gymId });
    if (!plan) throw new NotFoundException('Plan no encontrado');

    const start = new Date(dto.startDate);
    const startDate = format(start, 'yyyy-MM-dd');
    const endDate = format(addDays(start, plan.durationDays), 'yyyy-MM-dd');

    const membership = this.repo.create({
      ...dto,
      memberId: member.id,
      gymId,
      startDate,
      endDate,
      status: MembershipStatus.PENDING_PAYMENT,
      createdBy,
    });

    return this.repo.save(membership);
  }

  async activate(id: string, gymId: string) {
    const m = await this.findOne(id, gymId);
    await this.repo.update(id, { status: MembershipStatus.ACTIVE });
    return { ...m, status: MembershipStatus.ACTIVE };
  }

  async cancel(id: string, gymId: string) {
    const m = await this.findOne(id, gymId);
    if (m.status === MembershipStatus.CANCELLED) throw new BadRequestException('Ya está cancelada');
    await this.repo.update(id, { status: MembershipStatus.CANCELLED });
    return { message: 'Membresía cancelada' };
  }

  async freeze(id: string, gymId: string, frozenUntil: string) {
    const m = await this.findOne(id, gymId);
    if (m.status !== MembershipStatus.ACTIVE) throw new BadRequestException('Solo se puede congelar una membresía activa');
    if (m.freezesUsed >= m.plan.maxFreezes) throw new BadRequestException('Límite de congelamientos alcanzado');

    const today = format(new Date(), 'yyyy-MM-dd');
    await this.repo.update(id, {
      status: MembershipStatus.FROZEN,
      frozenAt: today,
      frozenUntil,
      freezesUsed: m.freezesUsed + 1,
    });
    return { message: 'Membresía congelada' };
  }

  async findExpiring(gymId: string, days: number = 7) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const limit = format(addDays(new Date(), days), 'yyyy-MM-dd');

    return this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.member', 'member')
      .leftJoinAndSelect('m.plan', 'plan')
      .where('m.gym_id = :gymId', { gymId })
      .andWhere('m.status = :status', { status: MembershipStatus.ACTIVE })
      .andWhere('m.end_date BETWEEN :today AND :limit', { today, limit })
      .orderBy('m.endDate', 'ASC')
      .getMany();
  }
}
