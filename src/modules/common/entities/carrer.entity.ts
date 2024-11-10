import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { District } from './district.entity';

@Entity('info_career')
export class Career {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    iconUrl: string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
