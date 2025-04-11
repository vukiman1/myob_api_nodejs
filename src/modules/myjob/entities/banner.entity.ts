import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({  default: 0 })
    isActive: boolean;

    @Column({ type: 'enum', enum: BannerType, default: BannerType.BANNER})
    type: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn()
    user: User;


    @Column({ nullable: true  })
    endDate: Date;

    @Column({ default: 0 , nullable: true })
    isExpried: boolean;

    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}

