import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { paginate, getSkip } from '../../../common/utils/pagination.util';

@Injectable()
export class MembersService {
  constructor(@InjectRepository(Member) private repo: Repository<Member>) {}

  async findAll(gymId: string, query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('m').where('m.gym_id = :gymId', { gymId });

    if (query.search) {
      qb.andWhere(
        '(m.first_name LIKE :s OR m.last_name LIKE :s OR m.document_number LIKE :s OR m.member_code LIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('m.firstName', 'ASC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(id: string, gymId: string) {
    const member = await this.repo.findOne({ where: { id, gymId } });
    if (!member) throw new NotFoundException('Cliente no encontrado');
    return member;
  }

  async create(dto: CreateMemberDto, gymId: string) {
    const exists = await this.repo.findOneBy({ gymId, documentNumber: dto.documentNumber });
    if (exists) throw new ConflictException('Ya existe un cliente con ese número de documento');

    const memberCode = await this.generateMemberCode(gymId);
    const member = this.repo.create({ ...dto, gymId, memberCode });
    return this.repo.save(member);
  }

  async update(id: string, dto: UpdateMemberDto, gymId: string) {
    const member = await this.findOne(id, gymId);
    Object.assign(member, dto);
    return this.repo.save(member);
  }

  async deactivate(id: string, gymId: string) {
    await this.findOne(id, gymId);
    await this.repo.update(id, { isActive: false });
    return { message: 'Cliente desactivado' };
  }

  async activate(id: string, gymId: string) {
    await this.findOne(id, gymId);
    await this.repo.update(id, { isActive: true });
    return { message: 'Cliente activado' };
  }

  async countActive(gymId: string) {
    return this.repo.count({ where: { gymId, isActive: true } });
  }

  private async generateMemberCode(gymId: string): Promise<string> {
    const count = await this.repo.count({ where: { gymId } });
    return `TX-${String(count + 1).padStart(4, '0')}`;
  }
}
