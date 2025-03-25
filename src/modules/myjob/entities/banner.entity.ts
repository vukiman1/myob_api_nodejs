import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('myjob_banner')
export class Banner {
    @PrimaryGeneratedColumn()
    id: string;
    
    @Column({ nullable: true  })
    imageUrl: string;


    @Column({ nullable: true  })
    imageMobileUrl: string;


    @Column({ nullable: true  })
    buttonText: string;

    @Column({ nullable: true  })
    description: string;

    @Column({ nullable: true  })
    buttonLink: string;

    @Column({default: 3  })
    descriptionLocation: number;

    @Column({ default: 0  })
    isShowButton: boolean;

    @Column({  default: 1 })
    isActive: boolean;

    @Column({ type: 'enum', enum: ['BANNER', 'POPUP'], default: 'BANNER' })
    type: string;

    @CreateDateColumn()
    createAt: Date;
  
    @UpdateDateColumn()
    updateAt: Date;
}
