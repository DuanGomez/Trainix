import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';

@Entity('gym_settings')
export class GymSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, unique: true, name: 'gym_id' })
  gymId: string;

  @OneToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ length: 10, default: 'COP' })
  currency: string;

  @Column({ length: 50, default: 'America/Bogota' })
  timezone: string;

  @Column({ type: 'time', default: '06:00', name: 'opening_time' })
  openingTime: string;

  @Column({ type: 'time', default: '22:00', name: 'closing_time' })
  closingTime: string;

  @Column({ nullable: true, name: 'max_capacity' })
  maxCapacity: number;

  @Column({ default: false, name: 'allow_checkin_without_membership' })
  allowCheckinWithoutMembership: boolean;

  @Column({ default: 0, name: 'checkin_grace_minutes' })
  checkinGraceMinutes: number;

  @Column({ default: 5, name: 'days_before_expiry_alert' })
  daysBeforeExpiryAlert: number;

  @Column({ type: 'text', nullable: true, name: 'receipt_footer_text' })
  receiptFooterText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
