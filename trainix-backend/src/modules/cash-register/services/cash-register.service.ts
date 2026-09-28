import {
  Injectable, BadRequestException, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashSession, CashSessionStatus } from '../entities/cash-session.entity';
import { CashMovement, CashMovementType } from '../entities/cash-movement.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { OpenSessionDto } from '../dto/open-session.dto';
import { CloseSessionDto } from '../dto/close-session.dto';

@Injectable()
export class CashRegisterService {
  constructor(
    @InjectRepository(CashSession) private sessionsRepo: Repository<CashSession>,
    @InjectRepository(CashMovement) private movementsRepo: Repository<CashMovement>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
  ) {}

  async findAll(gymId: string) {
    return this.sessionsRepo.find({
      where: { gymId },
      relations: ['openedByUser', 'closedByUser'],
      order: { openedAt: 'DESC' },
    });
  }

  async findCurrent(gymId: string) {
    return this.sessionsRepo.findOne({
      where: { gymId, status: CashSessionStatus.OPEN },
      relations: ['openedByUser'],
    });
  }

  async open(dto: OpenSessionDto, gymId: string, userId: string) {
    const existing = await this.findCurrent(gymId);
    if (existing) throw new ConflictException('Ya existe una sesión de caja abierta');

    return this.sessionsRepo.save(
      this.sessionsRepo.create({
        gymId,
        openedBy: userId,
        openingAmount: dto.openingAmount || 0,
        notes: dto.notes,
        status: CashSessionStatus.OPEN,
      }),
    );
  }

  async close(id: string, dto: CloseSessionDto, gymId: string, userId: string) {
    const session = await this.sessionsRepo.findOne({ where: { id, gymId } });
    if (!session) throw new NotFoundException('Sesión de caja no encontrada');
    if (session.status === CashSessionStatus.CLOSED) {
      throw new BadRequestException('La sesión ya está cerrada');
    }

    const cashPayments = await this.paymentsRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.total), 0)', 'total')
      .where('p.cash_session_id = :id', { id })
      .andWhere('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.method = :method', { method: PaymentMethod.CASH })
      .getRawOne();

    const expectedAmount = Number(session.openingAmount) + Number(cashPayments.total);
    const difference = dto.closingAmount - expectedAmount;

    await this.sessionsRepo.update(id, {
      status: CashSessionStatus.CLOSED,
      closedBy: userId,
      closingAmount: dto.closingAmount,
      expectedAmount,
      difference,
      closedAt: new Date(),
      notes: dto.notes || session.notes,
    });

    return this.sessionsRepo.findOne({ where: { id }, relations: ['openedByUser', 'closedByUser'] });
  }

  async getMovements(sessionId: string, gymId: string) {
    return this.movementsRepo.find({
      where: { cashSessionId: sessionId, gymId },
      order: { createdAt: 'ASC' },
    });
  }
}
