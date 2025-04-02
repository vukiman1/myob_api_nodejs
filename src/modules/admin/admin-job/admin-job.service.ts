import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Repository } from 'typeorm';
import { UpdateJobPostDto } from './dto/update-job-post.dto';

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


    async updateJobPost(id: string, updateJobPostDto: UpdateJobPostDto): Promise<JobPost> {
        const jobPost = await this.jobPostRepository.findOne({ where: { id: parseInt(id) } });
        // Update the job post with the new values
        Object.assign(jobPost, updateJobPostDto);
        console.log(jobPost)
        return this.jobPostRepository.save(jobPost);
    }
}

