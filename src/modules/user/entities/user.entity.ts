import { Exclude } from '@nestjs/class-transformer';
import { CompanyFollowed } from 'src/modules/info/entities/company-followed.entity';
import { Company } from 'src/modules/info/entities/company.entity';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';
import { Resume } from 'src/modules/info/entities/resume.entity';
import { JobPostActivity } from 'src/modules/job/entities/job-post-activity.entity';
import { JobPostNotification } from 'src/modules/job/entities/job-post-notification.entity';
import { JobPostSaved } from 'src/modules/job/entities/job-post-saved.entity';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { PaymentHistory } from 'src/modules/payment/entities/payment.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
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
  isVerifyEmail: boolean;

  @Column({ default: 0 })
  isSupperuser: boolean;

  @Column({ default: 0 })
  isStaff: boolean;

  @Column({ default: 0 })
  hasCompany: boolean;

  @Column({ default: 'JOB_SEEKER' })
  roleName: string;

  @Column({ default: 0 })
  money: number;

  @Column({
    default:
      'https://res.cloudinary.com/myjob/image/upload/c_scale,h_200,w_200/myjob/Avatar/defaultAvatar.jpg',
  })
  avatarUrl: string;

  @Column({ nullable: true })
  avatarPublicId: string;

  @Column({ nullable: true })
  lastLogin: Date;

  @OneToOne(() => JobSeekerProfile, (profile) => profile.user)
  jobSeekerProfile: JobSeekerProfile;

  @OneToOne(() => Company, (Company) => Company.user)
  company: Company;

  @OneToMany(() => JobPost, (jobPost) => jobPost.user)
  jobPosts: JobPost[]; // Một User có thể có nhiều JobPost

  @OneToMany(() => PaymentHistory, (paymentHistory) => paymentHistory.user)
  paymentHistories: PaymentHistory[]; // Một User có thể có nhiều JobPost

  @OneToMany(() => JobPostActivity, (jobPostActivity) => jobPostActivity.user)
  jobPostActivity: JobPostActivity[]; 


  @OneToMany(() => CompanyFollowed, (companyFollowed) => companyFollowed.user)
  companyFollowed: CompanyFollowed[]; 

  @OneToMany(() => JobPostSaved, (jobPostSaved) => jobPostSaved.user)
  jobPostSaved: JobPostSaved[];

  @OneToMany(() => JobPostNotification, (jobPostNotification) => jobPostNotification.user)
  jobPostNotification: JobPostNotification[];

  @OneToMany(() => Resume, (resume) => resume.user)
  resume: Resume;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
