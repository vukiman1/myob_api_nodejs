import { Min } from "class-validator";
import { Career } from "src/modules/common/entities/carrer.entity";
import { Location } from "src/modules/common/entities/location.entity";
import { Company } from "src/modules/info/entities/company.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('job_post')
export class JobPost  {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    jobName: string;

    @Column()
    slug: string;

    @Column()
    deadline: Date;
    
    @Column()
    @Min(1) 
    quantity: number;
    
    @Column()
    genderRequired: string;
    
    @Column()
    jobDescription: string;
    
    @Column()
    jobRequirement: string;
    
    @Column()
    benefitsEnjoyed: string;
    
    @Column()
    position: number;
    
    @Column()
    typeOfWorkplace: number;
    
    @Column()
    experience: number;
    
    @Column()
    academicLevel: number;
    
    @Column()
    jobType: string;
    
    @Column()
    salaryMin: number;
    
    @Column()
    salaryMax: number;

    @Column({ default: 0 })
    isHot: boolean;

    @Column({ default: 0 })
    isUrgent: boolean;
    
    @Column()
    contactPersonName: string;
    @Column()

    contactPersonEmail:string;

    @Column()
    contactPersonPhone: string

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    shares: number
    
    @Column({ default: 1 })
    status: number

    @ManyToOne(() => User, (user) => user.jobPosts)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Location, (location) => location.jobPosts)
    @JoinColumn()
    location: Location;

    @ManyToOne(() => Career, (career) => career.jobPosts)
    @JoinColumn()
    career: Career;

    @ManyToOne(() => Company, (company) => company.jobPosts)
    @JoinColumn()
    company: Company;

    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}