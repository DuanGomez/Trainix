import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios del gimnasio' })
  findAll(@GymId() gymId: string, @Query() query: PaginationDto) {
    return this.usersService.findAll(gymId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario' })
  findOne(@Param('id') id: string, @GymId() gymId: string) {
    return this.usersService.findOne(id, gymId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario del staff' })
  create(@Body() dto: CreateUserDto, @GymId() gymId: string) {
    return this.usersService.create(dto, gymId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @GymId() gymId: string) {
    return this.usersService.update(id, dto, gymId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar usuario' })
  deactivate(@Param('id') id: string, @GymId() gymId: string) {
    return this.usersService.deactivate(id, gymId);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activar usuario' })
  activate(@Param('id') id: string, @GymId() gymId: string) {
    return this.usersService.activate(id, gymId);
  }
}
