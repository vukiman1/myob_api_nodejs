import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { City } from './city.entity';
import { District } from './district.entity';
import { IsNotEmpty } from 'class-validator';
import { JobPost } from 'src/modules/job/entities/job-post.entity';

@Entity('common_location')
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty()
    @Column()
    address: string;

    @Column({ nullable: true  })
    lat: string;

    @Column({ nullable: true  })
    lng: string;

    @ManyToOne(() => City)
    @JoinColumn()
    city: City;

    @ManyToOne(() => District, (district) => district.locations)
    @JoinColumn()
    district: District;

    @OneToMany(() => JobPost, (jobPost) => jobPost.location)
    jobPosts: JobPost[];

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
