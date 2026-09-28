import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';

export enum MuscleGroup {
  CHEST = 'chest', BACK = 'back', SHOULDERS = 'shoulders',
  BICEPS = 'biceps', TRICEPS = 'triceps', FOREARMS = 'forearms',
  CORE = 'core', GLUTES = 'glutes', QUADS = 'quads',
  HAMSTRINGS = 'hamstrings', CALVES = 'calves',
  FULL_BODY = 'full_body', CARDIO = 'cardio',
}

export enum Difficulty { BEGINNER = 'beginner', INTERMEDIATE = 'intermediate', ADVANCED = 'advanced' }

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym, { nullable: true })
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-enum', enum: MuscleGroup, nullable: true, name: 'muscle_group' })
  muscleGroup: MuscleGroup;

  @Column({ length: 100, nullable: true })
  equipment: string;

  @Column({ type: 'simple-enum', enum: Difficulty, nullable: true })
  difficulty: Difficulty;

  @Column({ type: 'text', nullable: true, name: 'video_url' })
  videoUrl: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ default: false, name: 'is_global' })
  isGlobal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
