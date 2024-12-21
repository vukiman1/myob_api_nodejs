import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { Location } from './location.entity'; // Ensure Location is imported

@Entity('common_district')
export class District {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;


    @ManyToOne(() => City, (city) => city.districts)
    @JoinColumn()
    city: City;

    @OneToMany(() => Location, (location) => location.district)
    locations: Location[];
    
    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}