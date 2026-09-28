import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymSettings } from '../entities/gym-settings.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(GymSettings) private repo: Repository<GymSettings>) {}

  async findByGym(gymId: string) {
    let settings = await this.repo.findOneBy({ gymId });
    if (!settings) {
      settings = await this.repo.save(this.repo.create({ gymId }));
    }
    return settings;
  }

  async update(gymId: string, dto: UpdateSettingsDto) {
    let settings = await this.repo.findOneBy({ gymId });
    if (!settings) {
      settings = this.repo.create({ gymId });
    }
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }
}
