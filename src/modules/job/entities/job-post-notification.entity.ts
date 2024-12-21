import { Career } from "src/modules/common/entities/carrer.entity";
import { City } from "src/modules/common/entities/city.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('job_post_notification')
export class JobPostNotification{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobName: string;

  @Column()
  position: number;

  @Column()
  experience: string;

  @Column()
  salary: number;

  @Column()
  frequency: number;

  @Column({default: 1})
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.jobPostNotification)
  @JoinColumn()
  user: User;
  
  @ManyToOne(() => Career, (career) => career.jobPostNotification)
  @JoinColumn()
  career: Career;

  @ManyToOne(() => City, (city) => city.jobPostNotification)
  @JoinColumn()
  city: City;

  @CreateDateColumn()
  createAt: Date;
  @UpdateDateColumn()
  updateAt: Date;
}

