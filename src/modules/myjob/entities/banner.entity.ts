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

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
