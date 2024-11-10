import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { City } from './city.entity';
import { District } from './district.entity';
import { IsNotEmpty } from 'class-validator';

@Entity('info_location')
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

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}

export class CreateLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty()
    @Column()
    address: string;

    @Column({ nullable: true  })
    lat: string;

    @Column({ nullable: true  })
    lng: string;

    @IsNotEmpty()
    @ManyToOne(() => City)
    @JoinColumn()
    city: City;
    
    
    @IsNotEmpty()
    @ManyToOne(() => District, (district) => district.locations)
    @JoinColumn()
    district: District;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}