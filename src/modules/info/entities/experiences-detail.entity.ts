import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Resume } from "./resume.entity"; 

@Entity('info_experiences-detail')
export class ExperiencesDetail {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  jobName: string;

  @Column()
  companyName: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  description: string;

  @ManyToOne(() => Resume, resume => resume.experiencesDetails)
  @JoinColumn()
  resume: Resume;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
