import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GymsService } from '../services/gyms.service';
import { CreateGymDto } from '../dto/create-gym.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Gyms')
@ApiBearerAuth('JWT-auth')
@Controller('gyms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los gimnasios' })
  findAll(@Query() query: PaginationDto) {
    return this.gymsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un gimnasio' })
  findOne(@Param('id') id: string) {
    return this.gymsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear gimnasio' })
  create(@Body() dto: CreateGymDto) {
    return this.gymsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar gimnasio' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateGymDto>) {
    return this.gymsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar gimnasio' })
  deactivate(@Param('id') id: string) {
    return this.gymsService.deactivate(id);
  }
}
