import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
@Unique(['email', 'gymId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym, { nullable: true })
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ type: 'varchar', length: 36, name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ length: 100, name: 'first_name' })
  firstName: string;

  @Column({ length: 100, name: 'last_name' })
  lastName: string;

  @Column({ length: 150 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  @Column({ type: 'text', nullable: true, name: 'password_reset_token' })
  passwordResetToken: string;

  @Column({ type: 'datetime', nullable: true, name: 'password_reset_expires' })
  passwordResetExpires: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
