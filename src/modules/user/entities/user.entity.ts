
import { Exclude } from '@nestjs/class-transformer';
import { Company } from 'src/modules/info/entities/company.entity';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

@Entity('auth_user')
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

  @Column({ default: 1 })
  isVerifyEmail:boolean
  

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
 
  @Column({ nullable: true  })
  lastLogin: string;

  @OneToOne(() => JobSeekerProfile, (profile) => profile.user)
  jobSeekerProfile: JobSeekerProfile;

  @OneToOne(() => Company, (Company) => Company.user)
  company: Company;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


