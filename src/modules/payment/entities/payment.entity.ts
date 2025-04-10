import { IsNotEmpty, IsNumber } from "class-validator";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



export enum TransactionType {
    DEPOSIT = 'DEPOSIT',       // Nạp tiền
    PURCHASE = 'PURCHASE',     // Mua dịch vụ
  }
@Entity('payment_history')
export class PaymentHistory {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    price: number

    @Column({nullable: true})
    method: string;

    @Column({nullable: true, default: TransactionType.DEPOSIT})
    transactionType: TransactionType
    
    @Column({  default: 0 })
    status: number;

    @Column({nullable: true})
    paymentId: string;

    @ManyToOne(() => User, (user) => user.paymentHistories, { nullable: true })
    @JoinColumn() 
    user: User;

    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}
