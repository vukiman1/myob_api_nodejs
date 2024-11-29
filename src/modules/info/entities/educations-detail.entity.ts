import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Resume } from "./resume.entity";

@Entity('info_education_detail')
export class EducationDetail {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  degreeName: string

  @Column()
  major: string

  @Column()
  trainingPlaceName: string

  @Column()
  startDate: Date;

  @Column({nullable: true})
  completedDate: Date;

  @Column()
  description: string;

  @ManyToOne(() => Resume, resume => resume.educationDetail)
  @JoinColumn()
  resume: Resume;

  
  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
