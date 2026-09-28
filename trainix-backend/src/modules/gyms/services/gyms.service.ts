import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gym } from '../entities/gym.entity';
import { CreateGymDto } from '../dto/create-gym.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { paginate, getSkip } from '../../../common/utils/pagination.util';

@Injectable()
export class GymsService {
  constructor(@InjectRepository(Gym) private repo: Repository<Gym>) {}

  async findAll(query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('g');
    if (query.search) {
      qb.where('g.name LIKE :s OR g.slug LIKE :s', { s: `%${query.search}%` });
    }
    qb.orderBy('g.name', 'ASC').skip(getSkip(query.page, query.limit)).take(query.limit);
    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const gym = await this.repo.findOneBy({ id });
    if (!gym) throw new NotFoundException('Gimnasio no encontrado');
    return gym;
  }

  async create(dto: CreateGymDto) {
    const exists = await this.repo.findOneBy({ slug: dto.slug });
    if (exists) throw new ConflictException('El slug ya está en uso');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<CreateGymDto>) {
    const gym = await this.findOne(id);
    Object.assign(gym, dto);
    return this.repo.save(gym);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'Gimnasio desactivado' };
  }
}
