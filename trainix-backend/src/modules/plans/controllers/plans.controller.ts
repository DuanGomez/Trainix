import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlansService } from '../services/plans.service';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Plans')
@ApiBearerAuth('JWT-auth')
@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar planes activos' })
  findAll(@GymId() gymId: string) { return this.plansService.findAll(gymId); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plan' })
  findOne(@Param('id') id: string, @GymId() gymId: string) {
    return this.plansService.findOne(id, gymId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Crear plan' })
  create(@Body() dto: CreatePlanDto, @GymId() gymId: string) {
    return this.plansService.create(dto, gymId);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Actualizar plan' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePlanDto>, @GymId() gymId: string) {
    return this.plansService.update(id, dto, gymId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Desactivar plan' })
  deactivate(@Param('id') id: string, @GymId() gymId: string) {
    return this.plansService.deactivate(id, gymId);
  }
}
