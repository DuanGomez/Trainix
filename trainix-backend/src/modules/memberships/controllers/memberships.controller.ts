import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MembershipsService } from '../services/memberships.service';
import { CreateMembershipDto } from '../dto/create-membership.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { MembershipStatus } from '../../../common/enums/membership-status.enum';

@ApiTags('Memberships')
@ApiBearerAuth('JWT-auth')
@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly service: MembershipsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar membresías' })
  findAll(
    @GymId() gymId: string,
    @Query() query: PaginationDto,
    @Query('status') status?: MembershipStatus,
  ) {
    return this.service.findAll(gymId, { ...query, status });
  }

  @Get('expiring')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Membresías próximas a vencer' })
  findExpiring(@GymId() gymId: string, @Query('days') days?: number) {
    return this.service.findExpiring(gymId, Number(days) || 7);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Obtener membresía' })
  findOne(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.findOne(id, gymId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Crear membresía' })
  create(@Body() dto: CreateMembershipDto, @GymId() gymId: string, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, gymId, user.sub);
  }

  @Post(':id/cancel')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Cancelar membresía' })
  cancel(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.cancel(id, gymId);
  }

  @Post(':id/freeze')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Congelar membresía' })
  freeze(@Param('id') id: string, @GymId() gymId: string, @Body('frozenUntil') frozenUntil: string) {
    return this.service.freeze(id, gymId, frozenUntil);
  }
}
