import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { District } from './district.entity';
import { Resume } from 'src/modules/info/entities/resume.entity';
import { JobPostNotification } from 'src/modules/job/entities/job-post-notification.entity';

@Entity('common_city')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => District, (district) => district.city)
  districts: District[];

  @OneToMany(() => Resume, (resume) => resume.city)
  resume: Resume[];

  @OneToMany(() => JobPostNotification, (jobPostNotification) => jobPostNotification.city)
  jobPostNotification: JobPostNotification[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
