import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum BannerType {
    BANNER = 'BANNER',
    POPUP = 'POPUP',
}


@Entity('myjob_banner')
export class Banner {
    @PrimaryGeneratedColumn()
    id: string;
    
    @Column({ nullable: true  })
    imageUrl: string;

      
    @Column({ nullable: true  })
    description: string;  

    @Column({ nullable: true  })
    buttonLink: string;

    @Column({  default: 1 })
    isActive: boolean;

    @Column({ type: 'enum', enum: BannerType, default: BannerType.BANNER})
    type: string;

    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}

