import { User } from 'src/modules/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobPost } from './job-post.entity';

@Entity('job_post_saved')
export class JobPostSaved {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.jobPostSaved)
  user: User;

  @ManyToOne(() => JobPost, (jobPost) => jobPost.jobPostSaved)
  jobPost: JobPost;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}


export class JobPostSavedResponseDto {
  static toResponse(jobPost: JobPost, isApplied: boolean) {
    return {
      id: jobPost.id,
      slug: jobPost.slug,
      jobName: jobPost.jobName,
      deadline: jobPost.deadline,
      salaryMin: jobPost.salaryMin,
      salaryMax: jobPost.salaryMax,
      isHot: jobPost.isHot,
      isUrgent: jobPost.isUrgent,
      isApplied,
      companyDict: {
        id: jobPost.company?.id,
        slug: jobPost.company?.slug,
        companyName: jobPost.company?.companyName,
        employeeSize: jobPost.company?.employeeSize,
        companyImageUrl: jobPost.company?.companyImageUrl,
        mobileUserDict: {
          id: jobPost.user?.id,
          fullName: jobPost.user?.fullName,
          email: jobPost.user?.email,
        },
      },
      locationDict: {
        city: jobPost.location?.city?.id,
      },
    };
  }


}