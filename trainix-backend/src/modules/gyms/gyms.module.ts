import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymsController } from './controllers/gyms.controller';
import { GymsService } from './services/gyms.service';
import { Gym } from './entities/gym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gym])],
  controllers: [GymsController],
  providers: [GymsService],
  exports: [GymsService, TypeOrmModule],
})
export class GymsModule {}
