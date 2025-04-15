import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Repository, In } from 'typeorm';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { PaymentService } from 'src/modules/payment/payment.service';
import { TransactionType } from 'src/modules/payment/entities/payment.entity';

@Injectable()
export class AdminJobService {

    constructor(
         @InjectRepository(JobPost)
        private readonly jobPostRepository: Repository<JobPost>,
        private paymentService: PaymentService,
        
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

    async updateMultipleStatus(ids: any, userId: string) {
        const userMoney = await this.userRepository.findOne({ where: { id: userId } });
        console.log(ids, ids.length)
        const totalMoney = ids.length * 2000
        if (userMoney.money < totalMoney) {
            throw new Error('Not enough money to update status');
        }
   
        const money = 2000
              // Find the user who uploaded the banner
              const user = await this.userRepository.findOne({ where: { id: userId } });
              if (!user) {
                throw new Error('User not found');
              }
              if (user.money < 8000) {
                throw new BadRequestException('User not enought money')
              }
        await this.userRepository.update({ id: userId }, { money: userMoney.money - totalMoney });
        await this.paymentService.createTransaction(money, TransactionType.PURCHASE, userId, "PURCHASE")


        return this.jobPostRepository.update(
          { id: In(ids) },
          { isUrgent: true }
        );
      }


}

