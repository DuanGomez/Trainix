import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoutinesService } from '../services/routines.service';
import { CreateRoutineDto } from '../dto/create-routine.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Routines')
@ApiBearerAuth('JWT-auth')
@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.TRAINER)
export class RoutinesController {
  constructor(private readonly service: RoutinesService) {}

  @Get('exercises')
  @ApiOperation({ summary: 'Catálogo de ejercicios' })
  findExercises(@GymId() gymId: string) { return this.service.findExercises(gymId); }

  @Get()
  @ApiOperation({ summary: 'Listar rutinas' })
  findAll(@GymId() gymId: string, @Query() query: PaginationDto) {
    return this.service.findAll(gymId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rutina completa' })
  findOne(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.findOne(id, gymId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear rutina' })
  create(@Body() dto: CreateRoutineDto, @GymId() gymId: string) {
    return this.service.create(dto, gymId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar rutina' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoutineDto>, @GymId() gymId: string) {
    return this.service.update(id, dto, gymId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rutina' })
  delete(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.delete(id, gymId);
  }
}
