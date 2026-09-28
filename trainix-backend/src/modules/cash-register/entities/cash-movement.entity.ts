import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { CashSession } from './cash-session.entity';
import { Gym } from '../../gyms/entities/gym.entity';

export enum CashMovementType { INCOME = 'income', EXPENSE = 'expense' }

@Entity('cash_movements')
export class CashMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'cash_session_id' })
  cashSessionId: string;

  @ManyToOne(() => CashSession)
  @JoinColumn({ name: 'cash_session_id' })
  cashSession: CashSession;

  @Column({ type: 'varchar', length: 36, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ type: 'simple-enum', enum: CashMovementType })
  type: CashMovementType;

  @Column({ length: 200 })
  concept: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'payment_id' })
  paymentId: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
