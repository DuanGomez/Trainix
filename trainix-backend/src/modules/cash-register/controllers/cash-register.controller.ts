import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CashRegisterService } from '../services/cash-register.service';
import { OpenSessionDto } from '../dto/open-session.dto';
import { CloseSessionDto } from '../dto/close-session.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Cash Register')
@ApiBearerAuth('JWT-auth')
@Controller('cash-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
export class CashRegisterController {
  constructor(private readonly service: CashRegisterService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sesiones de caja' })
  findAll(@GymId() gymId: string) { return this.service.findAll(gymId); }

  @Get('current')
  @ApiOperation({ summary: 'Sesión de caja activa' })
  findCurrent(@GymId() gymId: string) { return this.service.findCurrent(gymId); }

  @Get(':id/movements')
  @ApiOperation({ summary: 'Movimientos de una sesión' })
  getMovements(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.getMovements(id, gymId);
  }

  @Post('open')
  @ApiOperation({ summary: 'Abrir sesión de caja' })
  open(@Body() dto: OpenSessionDto, @GymId() gymId: string, @CurrentUser() user: JwtPayload) {
    return this.service.open(dto, gymId, user.sub);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Cerrar sesión de caja' })
  close(@Param('id') id: string, @Body() dto: CloseSessionDto, @GymId() gymId: string, @CurrentUser() user: JwtPayload) {
    return this.service.close(id, dto, gymId, user.sub);
  }
}
