import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';
import { User } from '../../users/entities/user.entity';

export enum CashSessionStatus { OPEN = 'open', CLOSED = 'closed' }

@Entity('cash_sessions')
export class CashSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ type: 'varchar', length: 36, name: 'opened_by' })
  openedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'opened_by' })
  openedByUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'closed_by' })
  closedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'closed_by' })
  closedByUser: User;

  @Column({ type: 'simple-enum', enum: CashSessionStatus, default: CashSessionStatus.OPEN })
  status: CashSessionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'opening_amount' })
  openingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'closing_amount' })
  closingAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'expected_amount' })
  expectedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  difference: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'opened_at' })
  openedAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'closed_at' })
  closedAt: Date;
}
