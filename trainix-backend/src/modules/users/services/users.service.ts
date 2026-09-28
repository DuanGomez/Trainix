import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { hashPassword } from '../../../common/utils/bcrypt.util';
import { paginate, getSkip } from '../../../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findAll(gymId: string, query: PaginationDto) {
    const qb = this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('u.gym_id = :gymId', { gymId });

    if (query.search) {
      qb.andWhere(
        '(u.first_name LIKE :s OR u.last_name LIKE :s OR u.email LIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    const sortable = ['createdAt', 'firstName', 'lastName', 'email'];
    const sortBy = sortable.includes(query.sortBy ?? '') ? query.sortBy : 'createdAt';
    qb.orderBy(`u.${sortBy}`, query.order === 'ASC' ? 'ASC' : 'DESC')
      .skip(getSkip(query.page, query.limit))
      .take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data.map(this.sanitize), total, query.page, query.limit);
  }

  async findOne(id: string, gymId: string) {
    const user = await this.repo.findOne({
      where: { id, gymId },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitize(user);
  }

  async create(dto: CreateUserDto, gymId: string) {
    const exists = await this.repo.findOneBy({ email: dto.email, gymId });
    if (exists) throw new ConflictException('El email ya está registrado en este gimnasio');

    const user = this.repo.create({
      ...dto,
      gymId,
      passwordHash: await hashPassword(dto.password),
    });

    const saved = await this.repo.save(user);
    return this.sanitize(saved);
  }

  async update(id: string, dto: UpdateUserDto, gymId: string) {
    const user = await this.repo.findOneBy({ id, gymId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.sanitize(saved);
  }

  async deactivate(id: string, gymId: string) {
    const user = await this.repo.findOneBy({ id, gymId });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.repo.update(id, { isActive: false });
    return { message: 'Usuario desactivado' };
  }

  async activate(id: string, gymId: string) {
    const user = await this.repo.findOneBy({ id, gymId });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.repo.update(id, { isActive: true });
    return { message: 'Usuario activado' };
  }

  private sanitize(user: User) {
    const { passwordHash, refreshToken, passwordResetToken, ...safe } = user;
    return safe;
  }
}
