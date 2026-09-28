import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permissionsRepo: Repository<Permission>,
  ) {}

  findAll() {
    return this.rolesRepo.find({ relations: ['permissions'] });
  }

  async findOne(id: string) {
    const role = await this.rolesRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  findAllPermissions() {
    return this.permissionsRepo.find({ order: { module: 'ASC', action: 'ASC' } });
  }

  async create(dto: CreateRoleDto) {
    const role = this.rolesRepo.create({ name: dto.name, description: dto.description });
    if (dto.permissionIds?.length) {
      role.permissions = await this.permissionsRepo.findBy({ id: In(dto.permissionIds) });
    }
    return this.rolesRepo.save(role);
  }

  async updatePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.findOne(roleId);
    if (role.isSystem) throw new Error('No se pueden modificar los permisos de roles del sistema');
    role.permissions = await this.permissionsRepo.findBy({ id: In(permissionIds) });
    return this.rolesRepo.save(role);
  }
}
