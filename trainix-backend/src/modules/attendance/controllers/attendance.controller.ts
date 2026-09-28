import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CheckinDto } from '../dto/checkin.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST, Role.TRAINER)
  @ApiOperation({ summary: 'Historial de asistencias (con búsqueda)' })
  findAll(@GymId() gymId: string, @Query() query: PaginationDto) {
    return this.service.findAll(gymId, query);
  }

  @Get('today')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST, Role.TRAINER)
  @ApiOperation({ summary: 'Asistencias del día actual' })
  findToday(@GymId() gymId: string, @Query() query: PaginationDto) {
    return this.service.findToday(gymId, query);
  }

  @Post('checkin')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Registrar check-in' })
  checkin(@Body() dto: CheckinDto, @GymId() gymId: string, @CurrentUser() user: JwtPayload) {
    return this.service.checkin(dto, gymId, user.sub);
  }

  @Post('checkout')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Registrar check-out' })
  checkout(@Body() dto: CheckinDto, @GymId() gymId: string, @CurrentUser() user: JwtPayload) {
    return this.service.checkout(dto, gymId, user.sub);
  }
}
