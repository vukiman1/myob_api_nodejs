import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { City } from './city.entity';
import { District } from './district.entity';
import { IsNotEmpty } from 'class-validator';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';

@Entity('common_location')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  address: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lng: number;

  @ManyToOne(() => City)
  @JoinColumn()
  city: City;

  @ManyToOne(() => District, (district) => district.locations)
  @JoinColumn()
  district: District;

  @OneToMany(() => JobPost, (jobPost) => jobPost.location)
  jobPosts: JobPost[];

  @OneToMany(
    () => JobSeekerProfile,
    (jobSeekerProfile) => jobSeekerProfile.location,
  )
  jobSeekerProfiles: JobSeekerProfile[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
