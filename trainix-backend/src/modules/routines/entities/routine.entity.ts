import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';
import { Member } from '../../members/entities/member.entity';
import { User } from '../../users/entities/user.entity';
import { RoutineDay } from './routine-day.entity';
import { Difficulty } from './exercise.entity';

@Entity('routines')
export class Routine {
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

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'trainer_id' })
  trainerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'trainer_id' })
  trainer: User;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'simple-enum', enum: Difficulty, nullable: true })
  difficulty: Difficulty;

  @Column({ nullable: true, name: 'duration_weeks' })
  durationWeeks: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => RoutineDay, (day) => day.routine, { cascade: true, eager: true })
  days: RoutineDay[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
