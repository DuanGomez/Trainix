import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar pagos' })
  findAll(@GymId() gymId: string, @Query() query: PaginationDto) {
    return this.service.findAll(gymId, query);
  }

  @Get('today-total')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Total recaudado hoy, por método de pago' })
  getTodayTotal(@GymId() gymId: string) {
    return this.service.getTodayTotal(gymId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Obtener pago' })
  findOne(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.findOne(id, gymId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Registrar pago' })
  create(@Body() dto: CreatePaymentDto, @GymId() gymId: string, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, gymId, user.sub);
  }

  @Post(':id/refund')
  @Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
  @ApiOperation({ summary: 'Anular pago' })
  refund(@Param('id') id: string, @GymId() gymId: string) {
    return this.service.refund(id, gymId);
  }
}
