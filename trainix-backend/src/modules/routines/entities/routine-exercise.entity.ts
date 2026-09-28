import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { RoutineDay } from './routine-day.entity';
import { Exercise } from './exercise.entity';

@Entity('routine_exercises')
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'routine_day_id' })
  routineDayId: string;

  @ManyToOne(() => RoutineDay, (day) => day.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_day_id' })
  routineDay: RoutineDay;

  @Column({ type: 'varchar', length: 36, name: 'exercise_id' })
  exerciseId: string;

  @ManyToOne(() => Exercise, { eager: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ default: 3 })
  sets: number;

  @Column({ length: 20, default: '10' })
  reps: string;

  @Column({ length: 50, nullable: true })
  weight: string;

  @Column({ nullable: true, name: 'rest_seconds' })
  restSeconds: number;

  @Column({ nullable: true, name: 'duration_seconds' })
  durationSeconds: number;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
