import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class GymAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user, params } = context.switchToHttp().getRequest();

    if (user.role === Role.SUPER_ADMIN) return true;

    const gymId = params.gymId || user.gymId;
    if (!gymId || user.gymId !== gymId) {
      throw new ForbiddenException('No tienes acceso a este gimnasio');
    }

    return true;
  }
}
