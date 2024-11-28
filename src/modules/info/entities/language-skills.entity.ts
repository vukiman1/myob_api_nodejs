import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Resume } from "./resume.entity";

@Entity('info_language_skills')
export class LanguageSkills {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  language: string;

  @Column()
  level: string;

  @ManyToOne(() => Resume, resume => resume.languageSkills)
  @JoinColumn()
  resume: Resume;


  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
