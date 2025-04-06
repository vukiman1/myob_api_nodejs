import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('myjob_analytics')
export class Analytics {
    @PrimaryColumn()
    id: number;

    @Column({default: 0})
    job_seeker_views: number
}