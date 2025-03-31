import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminJobService {

    constructor(
         @InjectRepository(JobPost)
        private readonly jobPostRepository: Repository<JobPost>,
    ) {}
    
    async getJobDetail(id: string) {
        try {
            const jobPost = await this.jobPostRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['company', 'user'],
            });
            console.log('jobPost', jobPost);
            
            return jobPost;
        } catch (error) {
            console.error('Error getting job detail:', error);
            throw error;
        }
    }
}
