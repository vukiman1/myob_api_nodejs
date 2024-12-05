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

