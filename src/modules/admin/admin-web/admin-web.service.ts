import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { Company } from 'src/modules/info/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { JobPostActivity } from 'src/modules/job/entities/job-post-activity.entity';
import { Resume } from 'src/modules/info/entities/resume.entity';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';
import { Career } from 'src/modules/common/entities/carrer.entity';
import moment from 'moment';

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
        private careerRepository: Repository<Career>

    ){}

    async getDashboardData(filters: DashboardFilterDto) {
        // const [jobs, candidates, companies, users, stats, additionalStats, notifications, topJobs, chartData] =
        const [candidates] =
          await Promise.all([
            // this.getJobs(filters),
            this.getCandidates(filters),
            // this.getCompanies(filters),
            // this.getUsers(filters),
            // this.getStats(filters),
            // this.getAdditionalStats(filters),
            // this.getNotifications(filters),
            // this.getTopJobs(filters),
            // this.getChartData(filters),
          ])
    
        return {
            candidates
        }
      }
    
    async getJobs(filters: DashboardFilterDto) {
        try {
            const queryBuilder = this.jobPostRepository
                .createQueryBuilder("job")
                .leftJoinAndSelect("job.company", "company")
                .leftJoinAndSelect("job.career", "career")
                .leftJoinAndSelect("job.location", "location")
  
            // Apply industry filter
            if (filters.industry && filters.industry !== "all") {
                queryBuilder.andWhere("career.name = :industry", { industry: filters.industry })
            }

            // Apply date range filter
            if (filters.startDate && filters.endDate) {
                queryBuilder.andWhere("job.createAt BETWEEN :startDate AND :endDate", {
                    startDate: moment(filters.startDate).startOf("day").toDate(),
                    endDate: moment(filters.endDate).endOf("day").toDate(),
                })
            }

            const jobs = await queryBuilder.getMany()

            // Get application count for each job
            const jobsWithApplications = await Promise.all(
                jobs.map(async (job) => {
                    try {
                        const applicationCount = await this.jobPostActivityRepository.count({
                            where: {
                                jobPost: { id: job.id },
                                status: 1,
                            },
                        })

                        // Calculate trend (simplified version)
                        const previousPeriodApplications = await this.jobPostActivityRepository.count({
                            where: {
                                jobPost: { id: job.id },
                                status: 1,
                                createAt: Between(moment().subtract(14, "days").toDate(), moment().subtract(7, "days").toDate()),
                            },
                        })

                        const currentPeriodApplications = await this.jobPostActivityRepository.count({
                            where: {
                                jobPost: { id: job.id },
                                status: 1,
                                createAt: Between(moment().subtract(7, "days").toDate(), moment().toDate()),
                            },
                        })

                        const trend = currentPeriodApplications > previousPeriodApplications ? "up" : "down"

                        return {
                            id: job.id,
                            title: job.jobName,
                            industry: job.career.name,
                            status: job.status,
                            createAt: job.createAt,
                            company: job.company.companyName,
                            applications: applicationCount,
                            trend,
                        }
                    } catch (error) {
                        console.error(`Error processing job ${job.id}:`, error)
                        return null
                    }
                }),
            )

            return jobsWithApplications.filter(job => job !== null)

        } catch (error) {
            console.error('Error in getJobs:', error)
            throw error
        }
      }
    
      async getCandidates(filters: DashboardFilterDto) {
        const queryBuilder = this.jobPostActivityRepository
          .createQueryBuilder("activity")
          .leftJoinAndSelect("activity.user", "user")
          .leftJoinAndSelect("activity.resume", "resume")
          .leftJoinAndSelect("activity.jobPost", "jobPost")
          .leftJoinAndSelect("jobPost.career", "career")
          .leftJoinAndSelect("user.jobSeekerProfile", "profile")
          .where("activity.status = :status", { status: 1 })
    
        // Apply industry filter
        if (filters.industry && filters.industry !== "all") {
          queryBuilder.andWhere("career.name = :industry", { industry: filters.industry })
        }
    
        // Apply date range filter
        if (filters.startDate && filters.endDate) {
          queryBuilder.andWhere("activity.createAt BETWEEN :startDate AND :endDate", {
            startDate: moment(filters.startDate).startOf("day").toDate(),
            endDate: moment(filters.endDate).endOf("day").toDate(),
          })
        }
    
        const activities = await queryBuilder.getMany()
    
        return activities.map((activity) => ({
          id: activity.id,
          name: `${activity.user.fullName}`,
          appliedIndustry: activity.jobPost.career.name,
          status: activity.status,
          createAt: activity.createAt,
          avatar: activity.user.avatarUrl || null,
        }))
      }
    
      async getCompanies(filters: DashboardFilterDto) {
        const queryBuilder = this.companyRepository
          .createQueryBuilder("company")
          .leftJoinAndSelect("company.jobPosts", "jobPosts")
          .leftJoinAndSelect("jobPosts.career", "career")
    
        // Apply date range filter
        if (filters.startDate && filters.endDate) {
          queryBuilder.andWhere("company.createAt BETWEEN :startDate AND :endDate", {
            startDate: moment(filters.startDate).startOf("day").toDate(),
            endDate: moment(filters.endDate).endOf("day").toDate(),
          })
        }
    
        const companies = await queryBuilder.getMany()
    
        return companies.map((company) => {
          // Determine primary industry based on job posts
          const industries = company.jobPosts.map((job) => job.career.name)
          const industryCounts = {}
          industries.forEach((industry) => {
            industryCounts[industry] = (industryCounts[industry] || 0) + 1
          })
    
          const primaryIndustry = Object.keys(industryCounts).reduce(
            (a, b) => (industryCounts[a] > industryCounts[b] ? a : b),
            "",
          )
    
          return {
            id: company.id,
            name: company.companyName,
            industry: primaryIndustry || "N/A",
            createAt: company.createAt,
            logo: company.companyImageUrl,
          }
        })
      }
    
      async getUsers(filters: DashboardFilterDto) {
        const queryBuilder = this.userRepository.createQueryBuilder("user")
    
        // Apply date range filter
        if (filters.startDate && filters.endDate) {
          queryBuilder.andWhere("user.createAt BETWEEN :startDate AND :endDate", {
            startDate: moment(filters.startDate).startOf("day").toDate(),
            endDate: moment(filters.endDate).endOf("day").toDate(),
          })
        }
    
        const users = await queryBuilder.getMany()
    
        return users.map((user) => ({
          id: user.id,
          email: user.email,
          isActive: user.isActive,
          createAt: user.createAt,
          lastLogin: user.lastLogin,
        }))
      }
    
      async getStats(filters: DashboardFilterDto) {
        // Count open jobs
        const openJobsCount = await this.jobPostRepository.count({
          where: {
            status: 2,
            ...(filters.industry && filters.industry !== "all"
              ? {
                  career: { name: filters.industry },
                }
              : {}),
            ...(filters.startDate && filters.endDate
              ? {
                  createAt: Between(
                    moment(filters.startDate).startOf("day").toDate(),
                    moment(filters.endDate).endOf("day").toDate(),
                  ),
                }
              : {}),
          },
          relations: ["career"],
        })
    
        // Count new candidates today
        const newCandidatesCount = await this.jobPostActivityRepository.count({
          where: {
            status: 1,
            createAt: Between(moment().startOf("day").toDate(), moment().endOf("day").toDate()),
            ...(filters.industry && filters.industry !== "all"
              ? {
                  jobPost: { career: { name: filters.industry } },
                }
              : {}),
          },
          relations: ["jobPost", "jobPost.career"],
        })
    
        // Count registered companies
        const companiesCount = await this.companyRepository.count()
    
        // Count active users
        const activeUsersCount = await this.userRepository.count({
          where: { isActive: true },
        })
    
        // Calculate trends (simplified)
        const previousPeriodJobs = await this.jobPostRepository.count({
          where: {
            status: 3,
            createAt: Between(moment().subtract(14, "days").toDate(), moment().subtract(7, "days").toDate()),
          },
        })
    
        const currentPeriodJobs = await this.jobPostRepository.count({
          where: {
            status: 3,
            createAt: Between(moment().subtract(7, "days").toDate(), moment().toDate()),
          },
        })
    
        const jobsTrend = currentPeriodJobs > previousPeriodJobs ? "up" : "down"
        const jobsChange =
          previousPeriodJobs > 0
            ? `${Math.round(((currentPeriodJobs - previousPeriodJobs) / previousPeriodJobs) * 100)}%`
            : "+100%"
    
        // Similar calculations for other trends
        // (simplified for brevity)
    
        return [
          {
            title: "Công việc đang mở",
            value: openJobsCount,
            icon: "FileTextTwoTone",
            color: "#1890ff",
            change: jobsChange,
            trend: jobsTrend,
            suffix: "việc làm",
          },
          {
            title: "Ứng viên mới hôm nay",
            value: newCandidatesCount,
            icon: "UserAddOutlined",
            color: "#52c41a",
            change: "+8%",
            trend: "up",
            suffix: "ứng viên",
          },
          {
            title: "Công ty đăng ký",
            value: companiesCount,
            icon: "ShopTwoTone",
            color: "#fa8c16",
            change: "+5%",
            trend: "up",
            suffix: "công ty",
          },
          {
            title: "Người dùng hoạt động",
            value: activeUsersCount,
            icon: "TeamOutlined",
            color: "#722ed1",
            change: "+12%",
            trend: "up",
            suffix: "người dùng",
          },
        ]
      }
    
      async getAdditionalStats(filters: DashboardFilterDto) {
        // These would be calculated from actual data in a real implementation
        // For brevity, returning mock data similar to the attachment
        return [
          {
            title: "Tổng lượt xem",
            value: 1200,
            icon: "EyeOutlined",
            color: "#13c2c2",
            change: "+20%",
            trend: "up",
            suffix: "lượt xem",
          },
          {
            title: "Tỷ lệ chuyển đổi",
            value: 4.8,
            icon: "ThunderboltOutlined",
            color: "#eb2f96",
            change: "+2.5%",
            trend: "up",
            suffix: "%",
          },
          {
            title: "Tỷ lệ tuyển dụng",
            value: 35,
            icon: "FireOutlined",
            color: "#f5222d",
            change: "-3%",
            trend: "down",
            suffix: "%",
          },
          {
            title: "Thời gian tuyển dụng TB",
            value: 18,
            icon: "ClockCircleOutlined",
            color: "#faad14",
            change: "-2 ngày",
            trend: "up",
            suffix: "ngày",
          },
        ]
      }
    
      async getNotifications(filters: DashboardFilterDto) {
        // In a real implementation, this would query various tables to get recent activities
        // For brevity, returning mock data similar to the attachment
    
        // Example of how you might query for job post notifications
        const recentJobs = await this.jobPostRepository.find({
          where: {
            createAt: MoreThanOrEqual(moment().subtract(7, "days").toDate()),
          },
          relations: ["company"],
          take: 5,
          order: { createAt: "DESC" },
        })
    
        const jobNotifications = recentJobs.map((job) => ({
          id: `job-${job.id}`,
          message: `Công việc '${job.jobName}' vừa được đăng`,
          date: job.createAt,
          type: "job",
          icon: "FileTextTwoTone",
        }))
    
        // Example of how you might query for candidate notifications
        const recentApplications = await this.jobPostActivityRepository.find({
          where: {
            status: 1,
            createAt: MoreThanOrEqual(moment().subtract(7, "days").toDate()),
          },
          relations: ["user", "jobPost", "jobPost.career"],
          take: 5,
          order: { createAt: "DESC" },
        })
    
        const candidateNotifications = recentApplications.map((application) => ({
          id: `candidate-${application.id}`,
          message: `Ứng viên '${application.user.fullName}' ứng tuyển vào '${application.jobPost.career.name}'`,
          date: application.createAt,
          type: "candidate",
          icon: "UserAddOutlined",
        }))
    
        // Combine and sort notifications
        const allNotifications = [...jobNotifications, ...candidateNotifications]
          .sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())
          .slice(0, 5)
    
        return allNotifications
      }
    
      async getTopJobs(filters: DashboardFilterDto) {
        const queryBuilder = this.jobPostRepository
          .createQueryBuilder("job")
          .leftJoinAndSelect("job.company", "company")
          .leftJoinAndSelect("job.career", "career")
    
        // Apply industry filter
        if (filters.industry && filters.industry !== "all") {
          queryBuilder.andWhere("career.name = :industry", { industry: filters.industry })
        }
    
        // Apply date range filter
        if (filters.startDate && filters.endDate) {
          queryBuilder.andWhere("job.createAt BETWEEN :startDate AND :endDate", {
            startDate: moment(filters.startDate).startOf("day").toDate(),
            endDate: moment(filters.endDate).endOf("day").toDate(),
          })
        }
    
        const jobs = await queryBuilder.getMany()
    
        // Get application count for each job
        const jobsWithApplications = await Promise.all(
          jobs.map(async (job) => {
            const applicationCount = await this.jobPostActivityRepository.count({
              where: {
                jobPost: { id: job.id },
                status: 1,
              },
            })
    
            return {
              id: job.id,
              title: job.jobName,
              industry: job.career.name,
              status: job.status,
              createAt: job.createAt,
              company: job.company.companyName,
              applications: applicationCount,
              trend: applicationCount > 5 ? "up" : "down", // Simplified trend
            }
          }),
        )
    
        // Sort by application count and take top 5
        return jobsWithApplications.sort((a, b) => b.applications - a.applications).slice(0, 5)
      }
    
      async getChartData(filters: DashboardFilterDto) {
        // In a real implementation, these would be calculated from actual data
        // For brevity, returning mock data similar to the attachment
    
        // Example of how you might calculate job posting data by month and industry
        const jobPostingData = await this.calculateJobPostingByMonthAndIndustry()
    
        // Example of how you might calculate candidate trend data
        const candidateTrendData = await this.calculateCandidateTrendByDayAndIndustry()
    
        // Example of how you might calculate job status data
        const jobStatusData = await this.calculateJobStatusDistribution()
    
        // Example of how you might calculate industry demand data
        const industryDemandData = await this.calculateIndustryDemand()
    
        // Example of how you might calculate user registration data
        const userRegistrationData = await this.calculateUserRegistrationByMonth()
    
        // Example of how you might calculate application success data
        const applicationSuccessData = await this.calculateApplicationSuccessRates()
    
        // Example of how you might calculate application trend data
        const applicationTrendData = await this.calculateApplicationTrends()
    
        return {
          jobPostingData,
          candidateTrendData,
          jobStatusData,
          industryDemandData,
          userRegistrationData,
          applicationSuccessData,
          applicationTrendData,
        }
      }
    
      // Helper methods for chart data calculations
    
      private async calculateJobPostingByMonthAndIndustry() {
        // This would query job_post and career tables to get job counts by month and industry
        // For brevity, returning mock data
        return [
          { month: "Tháng 1", CNTT: 10, "Thiết kế": 5, Marketing: 2 },
          { month: "Tháng 2", CNTT: 15, "Thiết kế": 8, Marketing: 3 },
          { month: "Tháng 3", CNTT: 25, "Thiết kế": 10, Marketing: 5 },
        ]
      }
    
      private async calculateCandidateTrendByDayAndIndustry() {
        // This would query job_post_activity and related tables to get candidate counts by day and industry
        // For brevity, returning mock data
        return [
          { date: "27/03", CNTT: 3, "Thiết kế": 1, Marketing: 1 },
          { date: "28/03", CNTT: 5, "Thiết kế": 2, Marketing: 2 },
          { date: "29/03", CNTT: 8, "Thiết kế": 3, Marketing: 4 },
          { date: "30/03", CNTT: 10, "Thiết kế": 4, Marketing: 5 },
          { date: "31/03", CNTT: 12, "Thiết kế": 5, Marketing: 6 },
          { date: "01/04", CNTT: 15, "Thiết kế": 7, Marketing: 8 },
          { date: "02/04", CNTT: 18, "Thiết kế": 9, Marketing: 10 },
        ]
      }
    
      private async calculateJobStatusDistribution() {
        // Count jobs by status
        const openJobs = await this.jobPostRepository.count({ where: { status: 3} })
        const closedJobs = await this.jobPostRepository.count({ where: { status: 4 } })
        const expiredJobs = await this.jobPostRepository.count({ where: { status: 5 } })
    
        return [
          { name: "Đang mở", value: openJobs },
          { name: "Đã đóng", value: closedJobs },
          { name: "Hết hạn", value: expiredJobs },
        ]
      }
    
      private async calculateIndustryDemand() {
        // This would query job_post_activity and related tables to get application counts by industry
        // For brevity, returning mock data with a real query example
    
        const industries = await this.careerRepository.find()
    
        const industryDemand = await Promise.all(
          industries.map(async (industry) => {
            const applicationCount = await this.jobPostActivityRepository.count({
              where: {
                status: 1,
                jobPost: { career: { id: industry.id } },
              },
              relations: ["jobPost", "jobPost.career"],
            })
    
            return {
              name: industry.name,
              value: applicationCount,
            }
          }),
        )
    
        return industryDemand
      }
    
      private async calculateUserRegistrationByMonth() {
        // This would query user table to get user registration counts by month
        // For brevity, returning mock data
        return [
          { month: "Tháng 1", users: 5 },
          { month: "Tháng 2", users: 8 },
          { month: "Tháng 3", users: 15 },
        ]
      }
    
      private async calculateApplicationSuccessRates() {
        // Count applications by status
        const acceptedApplications = await this.jobPostActivityRepository.count({
          where: {
            status: 1,
          },
        })
    
        const pendingApplications = await this.jobPostActivityRepository.count({
          where: {
            status: 1,
          },
        })
    
        const rejectedApplications = await this.jobPostActivityRepository.count({
          where: {
            status: 1,
          },
        })
    
        return [
          { name: "Thành công", value: acceptedApplications },
          { name: "Đang chờ", value: pendingApplications },
          { name: "Bị từ chối", value: rejectedApplications },
        ]
      }
    
      private async calculateApplicationTrends() {
        // This would query job_post_activity table to get application, interview, and hire counts by day
        // For brevity, returning mock data
        return [
          { date: "27/03", applications: 5, interviews: 2, hires: 1 },
          { date: "28/03", applications: 8, interviews: 3, hires: 1 },
          { date: "29/03", applications: 12, interviews: 5, hires: 2 },
          { date: "30/03", applications: 15, interviews: 7, hires: 3 },
          { date: "31/03", applications: 18, interviews: 8, hires: 4 },
          { date: "01/04", applications: 22, interviews: 10, hires: 5 },
          { date: "02/04", applications: 25, interviews: 12, hires: 6 },
        ]
      }
}
