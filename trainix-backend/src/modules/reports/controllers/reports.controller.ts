import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { DateRangeDto } from '../../../common/dto/date-range.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('financial')
  @ApiOperation({ summary: 'Reporte financiero por período' })
  financial(@GymId() gymId: string, @Query() query: DateRangeDto) {
    return this.service.getFinancialReport(gymId, query);
  }

  @Get('memberships')
  @ApiOperation({ summary: 'Reporte de membresías' })
  memberships(@GymId() gymId: string, @Query() query: DateRangeDto) {
    return this.service.getMembershipsReport(gymId, query);
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Reporte de asistencias' })
  attendance(@GymId() gymId: string, @Query() query: DateRangeDto) {
    return this.service.getAttendanceReport(gymId, query);
  }

  @Get('financial/excel')
  @ApiOperation({ summary: 'Exportar reporte financiero en Excel' })
  async financialExcel(@GymId() gymId: string, @Query() query: DateRangeDto, @Res() res: Response) {
    const buffer = await this.service.exportFinancialExcel(gymId, query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="trainix-financiero-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }
}
