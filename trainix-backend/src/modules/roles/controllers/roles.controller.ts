import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  findAll() { return this.rolesService.findAll(); }

  @Get('permissions')
  @ApiOperation({ summary: 'Listar todos los permisos disponibles' })
  findAllPermissions() { return this.rolesService.findAllPermissions(); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol con permisos' })
  findOne(@Param('id') id: string) { return this.rolesService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Crear rol personalizado' })
  create(@Body() dto: CreateRoleDto) { return this.rolesService.create(dto); }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Actualizar permisos de un rol' })
  updatePermissions(@Param('id') id: string, @Body('permissionIds') ids: string[]) {
    return this.rolesService.updatePermissions(id, ids);
  }
}
