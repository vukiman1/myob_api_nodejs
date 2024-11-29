import { Location } from 'src/modules/common/entities/location.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Resume } from './resume.entity';

@Entity('info_job_seeker_profile')
export class JobSeekerProfile {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: 'S' })
  maritalStatus: string;

  @ManyToOne(() => Location, (location) => location.jobSeekerProfiles, {
    nullable: true,
  })
  @JoinColumn()
  location: Location;

  @OneToOne(() => Resume, (resume) => resume.jobSeekerProfile)
  resume: Resume;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
