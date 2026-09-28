import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';
import { Member } from '../../members/entities/member.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { AttendanceType } from '../../../common/enums/attendance-type.enum';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ type: 'varchar', length: 36, name: 'member_id' })
  memberId: string;

  @ManyToOne(() => Member, { eager: true })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'membership_id' })
  membershipId: string;

  @ManyToOne(() => Membership, { nullable: true })
  @JoinColumn({ name: 'membership_id' })
  membership: Membership;

  @Column({ type: 'simple-enum', enum: AttendanceType })
  type: AttendanceType;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', name: 'recorded_at' })
  recordedAt: Date;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'recorded_by' })
  recordedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
