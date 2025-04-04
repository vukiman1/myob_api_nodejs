import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Company } from 'src/modules/info/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { JobPostActivity } from 'src/modules/job/entities/job-post-activity.entity';
import { Resume } from 'src/modules/info/entities/resume.entity';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';
import { Career } from 'src/modules/common/entities/carrer.entity';
import moment from 'moment';
import { Injectable } from '@nestjs/common';
import { CompanyFollowed } from 'src/modules/info/entities/company-followed.entity';
import { WebNotification } from 'src/modules/myjob/entities/notifications.entity';

@Injectable()
export class AdminWebService {
    constructor(
        @InjectRepository(JobPost)
        private jobPostRepository: Repository<JobPost>,

        @InjectRepository(Company)
        private companyRepository: Repository<Company>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(JobPostActivity)
        private jobPostActivityRepository: Repository<JobPostActivity>,

        @InjectRepository(Resume)
        private resumeRepository: Repository<Resume>,

        @InjectRepository(JobSeekerProfile)
        private jobSeekerProfileRepository: Repository<JobSeekerProfile>,

        @InjectRepository(Career)
        private careerRepository: Repository<Career>,

        @InjectRepository(CompanyFollowed)
        private companyFollowedRepository: Repository<CompanyFollowed>,

        @InjectRepository(WebNotification)
        private webNotificationRepository: Repository<WebNotification>

    ){}

    async getDashboardData() {
        return {
          overview: await this.overViewWebData(),
          jobPostTrends: await this.jobPostTrends(),
          applicationTrends: await this.applicationTrends(),
          conversionRate: await this.conversionRate(),
          jobPostApprovalStats: await this.jobPostApprovalStats(),
          companyPerformance: await this.companyPerformance(),
          applicationByAcademicLevel: await this.applicationByAcademicLevel(),
          mostViewedJobs: await this.mostViewedJobs(),
          topCompanies: await this.topCompanies(),
          popularJobFields: await this.popularJobFields(),
          recentActivities: await this.recentActivities()
       }
      }

    async overViewWebData() {
        const totalJobPosts = await this.jobPostRepository.count();
        const totalCompanies = await this.companyRepository.count();
        const totalUsers = await this.userRepository.count();
        const totalApplications = await this.jobPostActivityRepository.count();
        const jobPostsPendingApproval = await this.jobPostRepository.count({ where: { status: 1 } });
        const jobPostsExpired = await this.jobPostRepository.count({ where: { isExpired: true } });
        const newUsersThisWeek = await this.userRepository.count({
            where: {
                createAt: MoreThanOrEqual(moment().subtract(7, 'days').toDate())
            }
        })
        return {
          totalJobPosts,
          totalCompanies,
          totalUsers,
          totalApplications,
          jobPostsPendingApproval,
          jobPostsExpired,
          newUsersThisWeek
        }
    }

    async jobPostTrends() {
      const startDate = moment().subtract(3, 'months').startOf('month').toDate();
      const currentPeriod = await this.jobPostRepository.createQueryBuilder('jobPost')
      .select('TO_CHAR(jobPost.createAt, \'Mon\')', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('jobPost.createAt >= :startDate', { startDate })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

      const previousPeriod = await this.jobPostRepository.createQueryBuilder('jobPost')
      .select('TO_CHAR(jobPost.createAt, \'Mon\')', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('jobPost.createAt >= :startDate AND jobPost.createAt < :endDate', {
      startDate: moment().subtract(1, 'year').subtract(3, 'months').startOf('month').toDate(),
      endDate: moment().subtract(1, 'year').startOf('month').toDate(),
      })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

      const labels = Array.from({ length: 4 }, (_, i) =>
      moment().subtract(3 - i, 'months').format('MMM')
      );

      const currentData = labels.map((month) => {
      const data = currentPeriod.find((item) => item.month === month);
      return data ? parseInt(data.count, 10) : 0;
      });

      const previousData = labels.map((month) => {
        const data = previousPeriod.find((item) => item.month === month);
        return data ? parseInt(data.count, 10) : 0;
      });

      const percentageChange = currentData.map((current, index) => {
        const previous = previousData[index] || 0;
        if (previous === 0) {
          return current > 0 ? 100 : 0; // If no data in the previous period, assume 100% increase if current > 0
        }
        return ((current - previous) / previous) * 100;
      });

      return {
      labels: labels.map((month) => `Tháng ${moment().month(month).format('M')}`),
      data: currentData,
      previousPeriod: percentageChange,
      };
    }

    async applicationTrends() {
        const startDate = moment().subtract(3, 'months').startOf('month').toDate();
        const currentPeriod = await this.jobPostActivityRepository.createQueryBuilder('jobPostActivity')
        .select('TO_CHAR(jobPostActivity.createAt, \'Mon\')', 'month')
        .addSelect('COUNT(*)', 'count')
        .where('jobPostActivity.createAt >= :startDate', { startDate })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

        const previousPeriod = await this.jobPostActivityRepository.createQueryBuilder('jobPostActivity')
        .select('TO_CHAR(jobPostActivity.createAt, \'Mon\')', 'month')
        .addSelect('COUNT(*)', 'count')
        .where('jobPostActivity.createAt >= :startDate AND jobPostActivity.createAt < :endDate', {
            startDate: moment().subtract(1, 'year').subtract(3, 'months').startOf('month').toDate(),
            endDate: moment().subtract(1, 'year').startOf('month').toDate(),
        })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

        const labels = Array.from({ length: 4 }, (_, i) =>
            moment().subtract(3 - i, 'months').format('MMM')
        );

        const currentData = labels.map((month) => {
            const data = currentPeriod.find((item) => item.month === month);
            return data ? parseInt(data.count, 10) : 0;
        });

        const previousData = labels.map((month) => {
            const data = previousPeriod.find((item) => item.month === month);
            return data ? parseInt(data.count, 10) : 0;
        });

        const percentageChange = currentData.map((current, index) => {
            const previous = previousData[index] || 0;
            if (previous === 0) {
                return current > 0 ? 100 : 0; // If no data in the previous period, assume 100% increase if current > 0
            }
            return ((current - previous) / previous) * 100;
        });

        return {
            labels: labels.map((month) => `Tháng ${moment().month(month).format('M')}`),
            data: currentData,
            previousPeriod: percentageChange,
    }
  }

  async conversionRate() {
    const views = await this.jobPostRepository
      .createQueryBuilder('jobPost')
      .select('SUM(jobPost.views)', 'totalViews')
      .getRawOne();
    const applies = await this.jobPostActivityRepository
      .createQueryBuilder('jobPostActivity')
      .select('COUNT(*)', 'totalApplies')
      .getRawOne();
    return {
      views: views?.totalViews || 0,
      applies: applies?.totalApplies || 0,
      rate: (applies?.totalApplies / views.totalViews).toFixed(2) 
    };
  }

  async jobPostApprovalStats() {
    const total = await this.jobPostRepository.count();
    const approved = await this.jobPostRepository.count({ where: { status: 3 } });
    const rejected = await this.jobPostRepository.count({ where: { status: 2 } });
    const pending = await this.jobPostRepository.count({ where: { status: 1 } });

    return {
      total,
      approved,
      rejected,
      pending
    }
  }

  async companyPerformance() {
    const companies = await this.companyRepository.find({ relations: ['jobPosts'] });

    const performanceData = await Promise.all(
      companies.map(async (company) => {
        const totalJobPosts = company.jobPosts.length;

        const applications = await this.jobPostActivityRepository.count({
          where: { jobPost: { company: { id: company.id } } },
        });

        const hires = await this.jobPostActivityRepository.count({
          where: { jobPost: { company: { id: company.id } }, status: 6 },
        });

        const hireRate = applications > 0 ? ((hires / applications) * 100).toFixed(1) : 0;

        return {
          companyName: company.companyName,
          jobPosts: totalJobPosts,
          applications,
          hireRate: parseFloat(hireRate.toString()),
        };
      })
    );

    return performanceData
      .sort((a, b) => b.jobPosts - a.jobPosts)
      .slice(0, 3); // Return top 3 companies with the most job posts
  }


  async applicationByAcademicLevel() {
    const academicLevels = [
      { id: 1, name: "Trên Đại học" },
      { id: 2, name: "Đại học" },
      { id: 3, name: "Cao đẳng" },
      { id: 4, name: "Trung cấp" },
      { id: 5, name: "Trung học" },
      { id: 6, name: "Chứng chỉ nghề" },
    ];
  
    const rawData = await this.jobPostActivityRepository
      .createQueryBuilder('jobPostActivity')
      .innerJoin('jobPostActivity.resume', 'resume')
      .select('resume.academicLevel', 'academicLevel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('resume.academicLevel')
      .getRawMany();
  
    const result = academicLevels.map((level) => {
      const data = rawData.find((item) => item.academicLevel == level.id);
      return {
        level: level.name,
        count: data ? parseInt(data.count, 10) : 0,
      };
    });
  
    return result;
  }
  
  async mostViewedJobs() {
    try {
      const jobs = await this.jobPostRepository.find({
        order: { views: 'DESC' },
        take: 3,
        relations: ['company'],
      });

      return await Promise.all(jobs.map(async job => ({
        id: job.id,
        jobTitle: job.jobName,
        company: job.company.companyName,
        views: job.views,
        applies: await this.jobPostActivityRepository.count({
          where: { jobPost: { id: job.id } },
        })
      })));
    } catch (error) {
      console.error('Error fetching most viewed jobs:', error);
      throw new Error(error);
    }
  }

  async topCompanies() {
    const topCompanies = await this.companyFollowedRepository
      .createQueryBuilder('companyFollowed')
      .select('companyFollowed.companyId', 'companyId')
      .addSelect('COUNT(companyFollowed.id)', 'followers')
      .innerJoin('companyFollowed.company', 'company')
      .groupBy('companyFollowed.companyId')
      .orderBy('followers', 'DESC')
      .limit(2)
      .getRawMany();

    return await Promise.all(
      topCompanies.map(async (company) => {
        const companyDetails = await this.companyRepository.findOne({
          where: { id: company.companyId },
          select: ['id', 'slug', 'companyName', 'companyImageUrl'],
        });

        return {
          id: companyDetails.id,
          slug: companyDetails.slug,
          companyName: companyDetails.companyName,
          followers: parseInt(company.followers, 10),
          logoUrl: companyDetails.companyImageUrl,
        };
      })
    );
  }

  async popularJobFields() {
    const top = await this.jobPostRepository.createQueryBuilder('jobPost')
      .select('career.name', 'field')
      .addSelect('COUNT(jobPost.careerId)', 'count')
      .innerJoin('jobPost.career', 'career')
      .groupBy('career.name')
      .orderBy('count', 'DESC')
      .limit(4)
      .getRawMany();
    return top.map((item) => ({
      field: item.field,
      count: parseInt(item.count, 10),
    }));
  }
  async recentActivities() {
    const recentActivities = await this.webNotificationRepository.find({
      order: { id: 'DESC' },
      take: 5,
    })

    return recentActivities.map(activity => ({
      id: activity.id,
      type: activity.title,
      message: activity.message,
      createAt: activity.date,
    }))
  }

}
