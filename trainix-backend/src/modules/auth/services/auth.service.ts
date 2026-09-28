import {
  Injectable, UnauthorizedException, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { comparePassword, hashPassword } from '../../../common/utils/bcrypt.util';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email, isActive: true },
      relations: ['role'],
    });

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Credenciales incorrectas');

    const tokens = await this.generateTokens(user);

    await this.usersRepo.update(user.id, {
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date(),
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersRepo.findOne({
        where: { id: payload.sub, isActive: true, refreshToken: dto.refreshToken },
        relations: ['role'],
      });

      if (!user) throw new UnauthorizedException('Refresh token inválido');

      const tokens = await this.generateTokens(user);
      await this.usersRepo.update(user.id, { refreshToken: tokens.refreshToken });

      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshToken: null });
    return { message: 'Sesión cerrada exitosamente' };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions', 'gym'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isMatch = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException('La contraseña actual es incorrecta');

    const newHash = await hashPassword(dto.newPassword);
    await this.usersRepo.update(userId, { passwordHash: newHash, refreshToken: null });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      gymId: user.gymId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, refreshToken, passwordResetToken, ...safe } = user;
    return safe;
  }
}
