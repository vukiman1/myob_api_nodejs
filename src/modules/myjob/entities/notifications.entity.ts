import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";



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
    isRead: boolean;

    @Column({default: 0})
    isDelete: boolean;

    @Column({enum:TypeEnums})
    type: string;

    @CreateDateColumn()
    createAt: Date;
}
