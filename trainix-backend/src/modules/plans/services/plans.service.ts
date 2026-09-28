import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { CreatePlanDto } from '../dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(@InjectRepository(Plan) private repo: Repository<Plan>) {}

  findAll(gymId: string) {
    return this.repo.find({ where: { gymId, isActive: true }, order: { price: 'ASC' } });
  }

  async findOne(id: string, gymId: string) {
    const plan = await this.repo.findOneBy({ id, gymId });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  create(dto: CreatePlanDto, gymId: string) {
    return this.repo.save(this.repo.create({ ...dto, gymId }));
  }

  async update(id: string, dto: Partial<CreatePlanDto>, gymId: string) {
    const plan = await this.findOne(id, gymId);
    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async deactivate(id: string, gymId: string) {
    await this.findOne(id, gymId);
    await this.repo.update(id, { isActive: false });
    return { message: 'Plan desactivado' };
  }
}
