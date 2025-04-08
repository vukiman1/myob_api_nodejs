import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Repository, In } from 'typeorm';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class AdminJobService {

    constructor(
         @InjectRepository(JobPost)
        private readonly jobPostRepository: Repository<JobPost>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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

    async getJobList(userId: string) {
        const jobList = await this.jobPostRepository.createQueryBuilder('job')
            .leftJoinAndSelect('job.career', 'career')
            .where('job.userId = :userId', { userId })
            .andWhere('job.isUrgent = false')
            .select([
                'job.id',
                'job.jobName',
                'job.createAt',
                'career.name AS careerName'
            ])
            .orderBy('job.createAt', 'DESC')
            .getRawMany();

        return jobList.map(job => ({
            id: job.job_id,
            jobName: job.job_jobName,
            createAt: job.job_createAt,
            careerName: job.careername
        }));
    }

    async updateMultipleStatus(ids: any, userid: string) {
        const userMoney = await this.userRepository.findOne({ where: { id: userid } });
        const totalMoney = ids.length * 2000
        if (userMoney.money < totalMoney) {
            throw new Error('Not enough money to update status');
        }

        await this.userRepository.update({ id: userid }, { money: userMoney.money - totalMoney });


        return this.jobPostRepository.update(
          { id: In(ids) },
          { isUrgent: true }
        );
      }


}

