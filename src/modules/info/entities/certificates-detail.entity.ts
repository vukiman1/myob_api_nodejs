import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Resume } from "./resume.entity";

@Entity('info_certificates_detail')
export class CertificatesDetail {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string

  @Column()
  trainingPlace: string

  @Column()
  startDate: Date;

  @Column({nullable: true})
  expirationDate: Date;

  @ManyToOne(() => Resume, resume => resume.certificatesDetail)
  @JoinColumn()
  resume: Resume;

  
  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
