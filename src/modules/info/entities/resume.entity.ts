import { Career } from 'src/modules/common/entities/carrer.entity';
import { City } from 'src/modules/common/entities/city.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { JobSeekerProfile } from './job_seeker_profle.entities';
import { ResumeViewed } from './resume-viewed.entity';

@Entity('info_resume')
export class Resume {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  salaryMin: number;

  @Column({ default: 0 })
  salaryMax: number;

  @Column({ nullable: true })
  position: number;

  @Column({ nullable: true })
  experience: number;

  @Column({ nullable: true })
  academicLevel: number;

  @Column({ nullable: true })
  typeOfWorkplace: number;

  @Column({ nullable: true })
  jobType: number;

  @Column({ default: 0 })
  isActive: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  publicId: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToOne(() => JobSeekerProfile)
  @JoinColumn()
  jobSeekerProfile: JobSeekerProfile;

  @ManyToOne(() => Career, (career) => career.resume)
  @JoinColumn()
  career: Career;

  @ManyToOne(() => City, (city) => city.resume)
  @JoinColumn()
  city: City;

  @OneToMany(() => ResumeViewed, (resumeViewed) => resumeViewed.resume)
  resumeViewed: ResumeViewed[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
