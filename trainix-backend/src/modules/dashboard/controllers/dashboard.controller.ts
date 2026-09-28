import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GymId } from '../../../common/decorators/gym-id.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'KPIs principales del dashboard' })
  getSummary(@GymId() gymId: string) { return this.service.getSummary(gymId); }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Datos gráfica de ingresos (últimos 6 meses)' })
  getRevenueChart(@GymId() gymId: string) { return this.service.getRevenueChart(gymId); }

  @Get('attendance-chart')
  @ApiOperation({ summary: 'Datos gráfica de asistencia (últimos 7 días)' })
  getAttendanceChart(@GymId() gymId: string) { return this.service.getAttendanceChart(gymId); }
}
