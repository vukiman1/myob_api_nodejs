//
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Resume } from './resume.entity';

@Entity('info_resume_saved')
export class ResumeSaved {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Resume, (resume) => resume.resumeViewed)
  resume: Resume;

  @ManyToOne(() => Company, (company) => company.resumeViewed)
  company: Company;

  @CreateDateColumn()
  createAt: Date;
  @UpdateDateColumn()
  updateAt: Date;
}
