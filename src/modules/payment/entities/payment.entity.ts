import { IsNotEmpty, IsNumber } from "class-validator";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('payment_history')
export class PaymentHistory {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    price: number

    @Column()
    method: string;
    

    @Column({  default: 0 })
    status: number;

    @Column()
    paymentId: string;

    @ManyToOne(() => User)
    @JoinColumn() 
    user: User;

    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}