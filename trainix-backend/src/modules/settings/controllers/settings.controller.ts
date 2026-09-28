import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GymId } from '../../../common/decorators/gym-id.decorator';
import { Role } from '../../../common/enums/role.enum';

@ApiTags('Settings')
@ApiBearerAuth('JWT-auth')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.GYM_ADMIN)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración del gimnasio' })
  findOne(@GymId() gymId: string) { return this.service.findByGym(gymId); }

  @Put()
  @ApiOperation({ summary: 'Actualizar configuración del gimnasio' })
  update(@GymId() gymId: string, @Body() dto: UpdateSettingsDto) {
    return this.service.update(gymId, dto);
  }
}
