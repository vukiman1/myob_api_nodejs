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

