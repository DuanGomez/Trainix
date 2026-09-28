import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipsController } from './controllers/memberships.controller';
import { MembershipsService } from './services/memberships.service';
import { Membership } from './entities/membership.entity';
import { Plan } from '../plans/entities/plan.entity';
import { Member } from '../members/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, Plan, Member])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService, TypeOrmModule],
})
export class MembershipsModule {}
