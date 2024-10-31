import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('info_job_seeker_profile')
export class JobSeekerProfile  {
    @PrimaryGeneratedColumn()
    id: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User

    @Column({ nullable: true  })
    phone: string;
    

    @Column({ nullable: true })
    birthday: Date;

    @Column({ nullable: true })
    gender: Boolean;

    @Column({ default: 'S'})
    maritalStatus: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}