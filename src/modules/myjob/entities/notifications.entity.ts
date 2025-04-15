import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



export enum TypeEnums {
    info = 'info',
    error = 'error',
    warning = 'warning',
    success = 'success'
}

@Entity('myjob_notification')
export class WebNotification {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({default: 'https://cdn-icons-png.flaticon.com/512/6610/6610575.png'})
    imageUrl: string;

    @Column({default: 0})
    read: boolean;

    @Column({default: 0})
    isDelete: boolean;

    @Column({enum:TypeEnums})
    type: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;
  

    @Column({ type: 'timestamptz', nullable: true })
    date: Date;
}
