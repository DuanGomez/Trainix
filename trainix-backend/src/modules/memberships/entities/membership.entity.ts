import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';
import { Member } from '../../members/entities/member.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { MembershipStatus } from '../../../common/enums/membership-status.enum';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ type: 'varchar', length: 36, name: 'member_id' })
  memberId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ type: 'varchar', length: 36, name: 'plan_id' })
  planId: string;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ type: 'simple-enum', enum: MembershipStatus, default: MembershipStatus.PENDING_PAYMENT })
  status: MembershipStatus;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'price_paid' })
  pricePaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'discount_amount' })
  discountAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 0, name: 'freezes_used' })
  freezesUsed: number;

  @Column({ type: 'date', nullable: true, name: 'frozen_at' })
  frozenAt: string;

  @Column({ type: 'date', nullable: true, name: 'frozen_until' })
  frozenUntil: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
