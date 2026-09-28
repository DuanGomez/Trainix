import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from '../entities/routine.entity';
import { RoutineDay } from '../entities/routine-day.entity';
import { Exercise } from '../entities/exercise.entity';
import { Member } from '../../members/entities/member.entity';
import { CreateRoutineDto } from '../dto/create-routine.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { paginate, getSkip } from '../../../common/utils/pagination.util';
import { findMemberByQuery } from '../../../common/utils/find-member.util';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine) private routinesRepo: Repository<Routine>,
    @InjectRepository(RoutineDay) private daysRepo: Repository<RoutineDay>,
    @InjectRepository(Exercise) private exercisesRepo: Repository<Exercise>,
    @InjectRepository(Member) private membersRepo: Repository<Member>,
  ) {}

  async findAll(gymId: string, query: PaginationDto) {
    const qb = this.routinesRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.member', 'member')
      .leftJoinAndSelect('r.trainer', 'trainer')
      .where('r.gym_id = :gymId', { gymId })
      .andWhere('r.is_active = :active', { active: true });

    if (query.search) {
      qb.andWhere(
        '(r.name LIKE :s OR member.first_name LIKE :s OR member.last_name LIKE :s OR member.member_code LIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('r.createdAt', 'DESC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(id: string, gymId: string) {
    const routine = await this.routinesRepo.findOne({
      where: { id, gymId },
      relations: ['member', 'trainer', 'days', 'days.exercises', 'days.exercises.exercise'],
      order: { days: { orderIndex: 'ASC' } },
    });
    if (!routine) throw new NotFoundException('Rutina no encontrada');
    return routine;
  }

  async create(dto: CreateRoutineDto, gymId: string) {
    const member = await findMemberByQuery(this.membersRepo, dto.memberId, gymId);
    const routine = this.routinesRepo.create({ ...dto, memberId: member.id, gymId });
    const saved = await this.routinesRepo.save(routine);
    return this.findOne(saved.id, gymId);
  }

  async update(id: string, dto: Partial<CreateRoutineDto>, gymId: string) {
    const routine = await this.findOne(id, gymId);
    const { days, memberId, ...fields } = dto;

    if (memberId) {
      const member = await findMemberByQuery(this.membersRepo, memberId, gymId);
      routine.memberId = member.id;
      routine.member = member;
    }
    Object.assign(routine, fields);

    // Los días se reemplazan completos; sus ejercicios se borran en cascada.
    if (days) {
      await this.daysRepo.delete({ routineId: id });
      routine.days = days.map((d) => this.daysRepo.create({ ...d, routineId: id }));
    }

    await this.routinesRepo.save(routine);
    return this.findOne(id, gymId);
  }

  async delete(id: string, gymId: string) {
    const routine = await this.findOne(id, gymId);
    await this.routinesRepo.remove(routine);
    return { message: 'Rutina eliminada' };
  }

  findExercises(gymId: string) {
    return this.exercisesRepo.find({
      where: [{ gymId }, { isGlobal: true }],
      order: { name: 'ASC' },
    });
  }
}
