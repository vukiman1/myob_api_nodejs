import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { District } from './district.entity';
import { JobPost } from 'src/modules/job/entities/job-post.entity';

@Entity('common_career')
export class Career {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    iconUrl: string;

    @OneToMany(() => JobPost, (jobPost) => jobPost.career)
    jobPosts: JobPost[];

    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}
