import { Location } from "src/modules/common/entities/location.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from "./company.entity";

@Entity('info_company_image')
export class CompanyImage  {
    @PrimaryGeneratedColumn()
    id: string;

    
    @Column()
    imageUrl: string;

    @Column({ nullable: true  })
    imagePublicId: string;

    @ManyToOne(() => Company, (company) => company.companyImage)
    @JoinColumn()
    company: Company;


    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}