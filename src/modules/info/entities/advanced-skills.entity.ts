import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Resume } from "./resume.entity";

@Entity('info_advanced_skills')
export class AdvancedSkills {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  level: string;

  @ManyToOne(() => Resume, resume => resume.advancedSkills)
  @JoinColumn()
  resume: Resume;

  
  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
