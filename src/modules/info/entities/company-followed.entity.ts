import { User } from "src/modules/user/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from "./company.entity";

@Entity('info_company_followed')
export class CompanyFollowed {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.companyFollowed)
    user: User;

    @ManyToOne(() => Company, (company) => company.companyFollowed)
    company: Company;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
