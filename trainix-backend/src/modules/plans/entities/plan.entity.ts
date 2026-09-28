import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';

export enum PlanDuration {
  DAILY = 'daily', WEEKLY = 'weekly', BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly', QUARTERLY = 'quarterly',
  BIANNUAL = 'biannual', ANNUAL = 'annual',
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: PlanDuration })
  duration: PlanDuration;

  @Column({ name: 'duration_days' })
  durationDays: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 0, name: 'max_freezes' })
  maxFreezes: number;

  @Column({ default: false, name: 'allows_guest' })
  allowsGuest: boolean;

  @Column({ default: true, name: 'includes_classes' })
  includesClasses: boolean;

  @Column({ length: 7, default: '#3D5AFE' })
  color: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
