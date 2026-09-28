import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';
import { Member } from '../../members/entities/member.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

export enum PaymentConcept { MEMBERSHIP = 'membership', PRODUCT = 'product', SERVICE = 'service', OTHER = 'other' }

@Entity('payments')
@Unique(['gymId', 'paymentNumber'])
export class Payment {
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

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'membership_id' })
  membershipId: string;

  @ManyToOne(() => Membership, { nullable: true })
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @Column({ length: 20, name: 'payment_number' })
  paymentNumber: string;

  @Column({ type: 'simple-enum', enum: PaymentConcept, default: PaymentConcept.MEMBERSHIP })
  concept: PaymentConcept;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'simple-enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'simple-enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'datetime', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'cash_session_id' })
  cashSessionId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
