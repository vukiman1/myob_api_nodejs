import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPost } from '../../job/entities/job-post.entity';
import { Career } from 'src/modules/common/entities/carrer.entity';

@Injectable()
export class AdminJobService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Career)
    private careerRepository: Repository<Career>
  ) {}

  async getJobs(options: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { search, status, page = 1, pageSize = 10 } = options;
    const queryBuilder = this.jobPostRepository.createQueryBuilder('jobPost')
      .leftJoinAndSelect('jobPost.career', 'career')
      .leftJoinAndSelect('jobPost.company', 'company')
      .leftJoinAndSelect('jobPost.jobPostActivity', 'jobPostActivity');

    if (search) {
      queryBuilder.where(
        '(jobPost.jobName LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    if (status) {
      queryBuilder.andWhere('jobPost.status = :status', { status });
    }
    
    const currentPage = page ? parseInt(page.toString()) : 1;
    const limit = pageSize ? parseInt(pageSize.toString()) : 10;
    const skip = (currentPage - 1) * limit;
    
    queryBuilder
      .orderBy('jobPost.createAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    // Format data for frontend
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      jobName: job.jobName,
      careerName: job.career?.name || '',
      deadline: job.deadline,
      quantity: job.quantity,
      isHot: job.isHot,
      isUrgent: job.isUrgent,
      status: this.getStatusText(job.status),
      views: job.views || 0,
      shares: job.shares || 0
    }));

    return {
      data: formattedJobs,
      count: total
    };
  }

  async getJobDetails(id: number) {
    const job = await this.jobPostRepository.findOne({
      where: { id },
      relations: [
        'user',
        'location',
        'career',
        'company',
        'jobPostSaved',
        'jobPostActivity'
      ]
    });
    
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    
    return {
      data: job
    };
  }

  async updateJobStatus(id: number, status: number) {
    await this.jobPostRepository.update(id, { status });
    return this.getJobDetails(id);
  }

  async deleteJob(id: number) {
    const job = await this.jobPostRepository.findOne({ where: { id } });
    if (job) {
      await this.jobPostRepository.remove(job);
      return true;
    }
    return false;
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Chờ duyệt';
      case 2:
        return 'Từ chối';
      case 3:
        return 'Đã duyệt';
      default:
        return 'Không xác định';
    }
  }
}
