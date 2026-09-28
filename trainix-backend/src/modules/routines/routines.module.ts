import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesController } from './controllers/routines.controller';
import { RoutinesService } from './services/routines.service';
import { Routine } from './entities/routine.entity';
import { RoutineDay } from './entities/routine-day.entity';
import { RoutineExercise } from './entities/routine-exercise.entity';
import { Exercise } from './entities/exercise.entity';
import { Member } from '../members/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routine, RoutineDay, RoutineExercise, Exercise, Member])],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService, TypeOrmModule],
})
export class RoutinesModule {}
