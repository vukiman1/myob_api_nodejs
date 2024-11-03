import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('myjob_feedback')
export class Feedback {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    content: string;
    

    @Column({  default: 5 })
    rating: number

    @Column({  default: 1 })
    isActive: boolean;

    @ManyToOne(() => User)
    @JoinColumn() 
    user: User;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}