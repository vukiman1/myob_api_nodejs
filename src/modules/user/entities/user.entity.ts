
import { Exclude } from '@nestjs/class-transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  fullName: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 1 })
  isActive: boolean;

  @Column({ default: 0 })
  isSupperuser: boolean;

  @Column({ default: 0 })
  isStaff: boolean;

  @Column({ default: 0 })
  hasCompany: boolean;

  @Column({ default: 'JOB_SEEKER' })
  roleName: string

  @Column({
    default: 'https://res.cloudinary.com/myjob/image/upload/c_scale,h_200,w_200/myjob/Avatar/defaultAvatar.jpg',
  })
  avatarUrl: string;
 
  @Column({ default: 'NULL' })
  lastLogin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
