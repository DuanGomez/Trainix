import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembersService } from '../services/members.service';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Members')
@ApiBearerAuth('JWT-auth')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST, Role.TRAINER)
  @ApiOperation({ summary: 'Listar clientes del gimnasio' })
  findAll(@GymId() gymId: string, @Query() query: PaginationDto) {
    return this.membersService.findAll(gymId, query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST, Role.TRAINER)
  @ApiOperation({ summary: 'Obtener cliente' })
  findOne(@Param('id') id: string, @GymId() gymId: string) {
    return this.membersService.findOne(id, gymId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Crear cliente' })
  create(@Body() dto: CreateMemberDto, @GymId() gymId: string) {
    return this.membersService.create(dto, gymId);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto, @GymId() gymId: string) {
    return this.membersService.update(id, dto, gymId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Desactivar cliente' })
  deactivate(@Param('id') id: string, @GymId() gymId: string) {
    return this.membersService.deactivate(id, gymId);
  }

  @Post(':id/activate')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Activar cliente' })
  activate(@Param('id') id: string, @GymId() gymId: string) {
    return this.membersService.activate(id, gymId);
  }
}
