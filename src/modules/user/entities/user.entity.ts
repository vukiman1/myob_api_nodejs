
import { Exclude } from '@nestjs/class-transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  user_id: string;

  @Column()
  userName: string;

  @Column({ nullable: true })
  fullName: string;


  @Column({
    default: 'https://kindycity.edu.vn/wp-content/uploads/2023/04/user-men.png',
  })
  avatar: string;
 
  @Column({ default: 'user' })
  role: string;

  @Column()
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 500 })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Exclude()
  @Column()
  passWord: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
