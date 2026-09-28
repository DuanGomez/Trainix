import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Routine } from './routine.entity';
import { RoutineExercise } from './routine-exercise.entity';

export enum WeekDay {
  MONDAY = 'monday', TUESDAY = 'tuesday', WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday', FRIDAY = 'friday', SATURDAY = 'saturday', SUNDAY = 'sunday',
}

@Entity('routine_days')
export class RoutineDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'routine_id' })
  routineId: string;

  @ManyToOne(() => Routine, (routine) => routine.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @Column({ type: 'simple-enum', enum: WeekDay })
  day: WeekDay;

  @Column({ length: 100, nullable: true })
  label: string;

  @Column({ default: 0, name: 'order_index' })
  orderIndex: number;

  @OneToMany(() => RoutineExercise, (ex) => ex.routineDay, { cascade: true, eager: true })
  exercises: RoutineExercise[];
}
