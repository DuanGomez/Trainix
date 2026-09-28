import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, OneToOne,
} from 'typeorm';

@Entity('gyms')
export class Gym {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 20, nullable: true })
  nit: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, default: 'Colombia' })
  country: string;

  @Column({ type: 'text', nullable: true, name: 'logo_url' })
  logoUrl: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ length: 50, default: 'basic', name: 'subscription_plan' })
  subscriptionPlan: string;

  @Column({ type: 'datetime', nullable: true, name: 'subscription_expires_at' })
  subscriptionExpiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
