import { Resume } from "src/modules/info/entities/resume.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JobPost } from "./job-post.entity";
import moment from "moment";

@Entity('job_post_activity')
export class JobPostActivity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({default: 1})
  status: number;

  @Column({default: 0})
  isSendMail: boolean;

  @Column({default: 0})
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.jobPostActivity)
  @JoinColumn()
  user: User;
  
  @ManyToOne(() => JobPost, (jobPost) => jobPost.jobPostActivity)
  jobPost: JobPost;

  @ManyToOne(() => Resume, resume => resume.jobPostActivity)
  @JoinColumn()
  resume: Resume;

  @CreateDateColumn()
  createAt: Date;
  @UpdateDateColumn()
  updateAt: Date;
}

export class JobActivityResponseDto {
  static toResponse(activity: any) {
    const jobPost = activity.jobPost;
    const company = jobPost.company;

    return {
      id: activity.id,
      createAt: moment(activity.createAt).format('YYYY-MM-DDTHH:mm:ssZ'),
      jobPostDict: {
        id: jobPost.id,
        slug: jobPost.slug,
        jobName: jobPost.jobName,
        deadline: moment(jobPost.deadline).format('YYYY-MM-DD'),
        salaryMin: jobPost.salaryMin,
        salaryMax: jobPost.salaryMax,
        isHot: jobPost.isHot,
        isUrgent: jobPost.isUrgent,
        companyDict: {
          id: company.id,
          slug: company.slug,
          companyName: company.companyName,
          employeeSize: company.employeeSize,
          companyImageUrl: company.companyImageUrl,
          mobileUserDict: activity.user
            ? {
                id: activity.user.id,
                fullName: activity.user.fullName,
                email: activity.user.email,
              }
            : null,
        },
        locationDict: {
          city: jobPost.location?.city,
        },
      },
      resumeDict: {
        id: activity.resume?.id,
        slug: activity.resume?.slug,
        title: activity.resume?.title,
        type: activity.resume?.type,
      },
    };
  }
}