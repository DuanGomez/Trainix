import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentConcept } from '../entities/payment.entity';
import { Member } from '../../members/entities/member.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { CashSession } from '../../cash-register/entities/cash-session.entity';
import { CashMovement, CashMovementType } from '../../cash-register/entities/cash-movement.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { MembershipStatus } from '../../../common/enums/membership-status.enum';
import { CashSessionStatus } from '../../cash-register/entities/cash-session.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { paginate, getSkip } from '../../../common/utils/pagination.util';
import { findMemberByQuery } from '../../../common/utils/find-member.util';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private repo: Repository<Payment>,
    @InjectRepository(Member) private membersRepo: Repository<Member>,
    @InjectRepository(Membership) private membershipsRepo: Repository<Membership>,
    @InjectRepository(CashSession) private cashSessionsRepo: Repository<CashSession>,
    @InjectRepository(CashMovement) private cashMovementsRepo: Repository<CashMovement>,
  ) {}

  async findAll(gymId: string, query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.member', 'member')
      .leftJoinAndSelect('p.membership', 'membership')
      .where('p.gym_id = :gymId', { gymId });

    if (query.search) {
      qb.andWhere(
        '(p.payment_number LIKE :s OR member.first_name LIKE :s OR member.last_name LIKE :s OR member.member_code LIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('p.createdAt', 'DESC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(id: string, gymId: string) {
    const p = await this.repo.findOne({ where: { id, gymId }, relations: ['member', 'membership'] });
    if (!p) throw new NotFoundException('Pago no encontrado');
    return p;
  }

  async create(dto: CreatePaymentDto, gymId: string, createdBy: string) {
    const member = await findMemberByQuery(this.membersRepo, dto.memberId, gymId);

    // Un pago de membresía sin membresía explícita salda la última pendiente del cliente.
    let membershipId = dto.membershipId;
    if (!membershipId && dto.concept === PaymentConcept.MEMBERSHIP) {
      const pending = await this.membershipsRepo.findOne({
        where: { memberId: member.id, gymId, status: MembershipStatus.PENDING_PAYMENT },
        order: { createdAt: 'DESC' },
      });
      membershipId = pending?.id;
    }

    const total = dto.amount - (dto.discount || 0);
    if (total <= 0) throw new BadRequestException('El total no puede ser cero o negativo');

    let cashSessionId: string | undefined;
    if (dto.method === PaymentMethod.CASH) {
      const session = await this.cashSessionsRepo.findOneBy({ gymId, status: CashSessionStatus.OPEN });
      if (!session) throw new BadRequestException('No hay una sesión de caja abierta');
      cashSessionId = session.id;
    }

    const paymentNumber = await this.generatePaymentNumber(gymId);
    const payment = await this.repo.save(
      this.repo.create({
        ...dto,
        memberId: member.id,
        membershipId,
        gymId,
        total,
        paymentNumber,
        createdBy,
        cashSessionId,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      }),
    );

    if (membershipId) {
      await this.membershipsRepo.update(membershipId, { status: MembershipStatus.ACTIVE });
    }

    if (dto.method === PaymentMethod.CASH && cashSessionId) {
      await this.cashMovementsRepo.save(
        this.cashMovementsRepo.create({
          cashSessionId,
          gymId,
          type: CashMovementType.INCOME,
          concept: `Pago membresía - ${member.fullName}`,
          amount: total,
          paymentId: payment.id,
          createdBy,
        }),
      );
    }

    return payment;
  }

  async refund(id: string, gymId: string) {
    const payment = await this.findOne(id, gymId);
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Solo se pueden anular pagos completados');
    }
    await this.repo.update(id, { status: PaymentStatus.REFUNDED });
    return { message: 'Pago anulado' };
  }

  async getTodayTotal(gymId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows: { method: string; total: string | number }[] = await this.repo
      .createQueryBuilder('p')
      .select('SUM(p.total)', 'total')
      .addSelect('p.method', 'method')
      .where('p.gym_id = :gymId', { gymId })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.paid_at >= :today', { today })
      .groupBy('p.method')
      .getRawMany();
    const breakdown = rows.map((r) => ({ method: r.method, total: Number(r.total) }));
    return { total: breakdown.reduce((sum, r) => sum + r.total, 0), breakdown };
  }

  private async generatePaymentNumber(gymId: string): Promise<string> {
    const count = await this.repo.count({ where: { gymId } });
    const year = new Date().getFullYear();
    return `TX-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
