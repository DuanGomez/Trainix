import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique,
} from 'typeorm';
import { Gym } from '../../gyms/entities/gym.entity';

export enum DocumentType { CC = 'CC', CE = 'CE', TI = 'TI', PASSPORT = 'PASAPORTE', NIT = 'NIT' }
export enum Gender { M = 'M', F = 'F', OTHER = 'OTHER' }
export enum BloodType { A_POS = 'A+', A_NEG = 'A-', B_POS = 'B+', B_NEG = 'B-', AB_POS = 'AB+', AB_NEG = 'AB-', O_POS = 'O+', O_NEG = 'O-' }

@Entity('members')
@Unique(['gymId', 'documentNumber'])
@Unique(['gymId', 'memberCode'])
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, name: 'gym_id' })
  gymId: string;

  @ManyToOne(() => Gym)
  @JoinColumn({ name: 'gym_id' })
  gym: Gym;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'user_id' })
  userId: string;

  @Column({ length: 20, name: 'member_code' })
  memberCode: string;

  @Column({ length: 100, name: 'first_name' })
  firstName: string;

  @Column({ length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'simple-enum', enum: DocumentType, default: DocumentType.CC, name: 'document_type' })
  documentType: DocumentType;

  @Column({ length: 20, name: 'document_number' })
  documentNumber: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: string;

  @Column({ type: 'simple-enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'simple-enum', enum: BloodType, nullable: true, name: 'blood_type' })
  bloodType: BloodType;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ length: 150, nullable: true, name: 'emergency_contact_name' })
  emergencyContactName: string;

  @Column({ length: 20, nullable: true, name: 'emergency_contact_phone' })
  emergencyContactPhone: string;

  @Column({ type: 'text', nullable: true, name: 'health_notes' })
  healthNotes: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'date', default: () => 'CURRENT_DATE', name: 'joined_at' })
  joinedAt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
