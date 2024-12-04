import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Resume } from 'src/modules/info/entities/resume.entity';
import { JobPostNotification } from 'src/modules/job/entities/job-post-notification.entity';

@Entity('common_career')
export class Career {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;

  @OneToMany(() => JobPost, (jobPost) => jobPost.career)
  jobPosts: JobPost[];

  @OneToMany(() => Resume, (resume) => resume.career)
  resume: Resume[];

  @OneToMany(() => JobPostNotification, (jobPostNotification) => jobPostNotification.career)
  jobPostNotification: JobPostNotification[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
