import { Min } from 'class-validator';
import { Career } from 'src/modules/common/entities/carrer.entity';
import { Location } from 'src/modules/common/entities/location.entity';
import { Company } from 'src/modules/info/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobPostSaved } from './job-post-saved.entity';
import { JobPostActivity } from './job-post-activity.entity';

@Entity('job_post')
export class JobPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_JOB_NAME')
  @Column()
  jobName: string;

  @Column()
  slug: string;
  
  @Index('IDX_JOB_DEADLINE')
  @Column()
  deadline: Date;

  @Column()
  @Min(1)
  quantity: number;

  @Column()
  genderRequired: string;

  @Column()
  jobDescription: string;

  @Column()
  jobRequirement: string;

  @Column()
  benefitsEnjoyed: string;

  @Column()
  position: number;

  @Column()
  typeOfWorkplace: number;

  @Column()
  experience: number;

  @Column()
  academicLevel: number;

  
  @Column()
  jobType: number;

  @Column()
  salaryMin: number;

  @Column()
  salaryMax: number;

  @Column({ default: 0 })
  isHot: boolean;

  @Column({ default: 0 })
  isUrgent: boolean;

  @Column({ default: 0 })
  isExpired: boolean;
  @BeforeInsert()
  @BeforeUpdate()
  updateIsExpired() {
    const now = new Date();
    this.isExpired = this.deadline < now;
  }

  @Column()
  contactPersonName: string;
  @Column()
  contactPersonEmail: string;

  @Column()
  contactPersonPhone: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  shares: number;

  @Index('IDX_JOB_STATUS')
  @Column({ default: 1 })
  status: number;


  @ManyToOne(() => User, (user) => user.jobPosts)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Location, (location) => location.jobPosts)
  @JoinColumn()
  location: Location;

  @ManyToOne(() => Career, (career) => career.jobPosts)
  @JoinColumn()
  career: Career;

  @ManyToOne(() => Company, (company) => company.jobPosts)
  @JoinColumn()
  company: Company;

  @OneToMany(() => JobPostSaved, (jobPostSaved) => jobPostSaved.jobPost)
  jobPostSaved: JobPostSaved[];

  @ManyToOne(() => JobPostActivity, (jobPostActivity) => jobPostActivity.jobPost)
  @JoinColumn()
  jobPostActivity: JobPostActivity;

  @CreateDateColumn()
  createAt: Date;
  @UpdateDateColumn()
  updateAt: Date;
}
