import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Location } from '../common/entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateJobPostDto, JobPostResponseDto } from './dto/job-post.dto';
import { JobPost } from './entities/job-post.entity';
import { User } from '../user/entities/user.entity';
import { Career } from '../common/entities/carrer.entity';
import { JwtService } from '@nestjs/jwt';
import { JobPostSaved } from './entities/job-post-saved.entity';
import {  JobPostActivity } from './entities/job-post-activity.entity';
import { Resume } from '../info/entities/resume.entity';
import { CreateJobPostActivityDto, JobActivityResponseDto, JobPostActivityResponseDto } from './dto/create-job-post-activity.dto';
import { JobPostNotification } from './entities/job-post-notification.entity';
import { City } from '../common/entities/city.entity';
import { CreateJobPostNotificationDto, JobPostNotificationResponseDto } from './dto/create-job-post-notification.dto';
import { JobPostSavedResponseDto } from './dto/job-post-saved.dto';
import { ResumeViewed } from '../info/entities/resume-viewed.entity';
import { ResumeSaved } from '../info/entities/resume-saved.entity';
import { CompanyFollowed } from '../info/entities/company-followed.entity';
import moment from 'moment';
import { EmployeeSendEmailDto } from './dto/employee-send-email.dto';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { relative } from 'path';

@Injectable()
export class JobService {
  constructor(
    private nodemailerService: NodemailerService,
    private readonly jwtService: JwtService,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(JobPostSaved)
    private jobPostSavedRepository: Repository<JobPostSaved>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Career)
    private careerRepository: Repository<Career>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(JobPostActivity)
    private jobPostActivityRepository: Repository<JobPostActivity>,
    @InjectRepository(JobPostNotification)
    private readonly jobPostNotificationRepository: Repository<JobPostNotification>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeViewed)
    private resumeViewedRepository: Repository<ResumeViewed>,
    @InjectRepository(ResumeSaved)
    private resumeSavedRepository: Repository<ResumeSaved>,
    @InjectRepository(CompanyFollowed)
    private companyFollowedRepository: Repository<CompanyFollowed>,

  ) {}

  async createPrivateJobPost(
    createJobPostDto: CreateJobPostDto,
    email: string,
  ) {
    const user = await this.findEmployer(email);
    const career = await this.careerRepository.findOne({
      where: { id: +createJobPostDto.career },
    });
    if (!career) {
      throw new NotFoundException('Career not found');
    }

    const newLocation = this.locationRepository.create({
      city: { id: createJobPostDto.location.city },
      district: { id: createJobPostDto.location.district },
      address: createJobPostDto.location.address,
      lat: createJobPostDto.location.lat,
      lng: createJobPostDto.location.lng,
    });

    const savedLocation = await this.locationRepository.save(newLocation);
    createJobPostDto.slug =
      (await this.generateSlug(createJobPostDto.jobName)) || 'no-name';

    const newJobPost = this.jobPostRepository.create({
      ...createJobPostDto,
      location: savedLocation,
      user: user,
      career: career,
      company: user.company,
    });

    const savedJobPost = await this.jobPostRepository.save(newJobPost);

    return JobPostResponseDto.toResponse(savedJobPost);
  }

  async findEmployer(email: string): Promise<any> {
    const employer = await this.userRepository.findOne({
      where: { email },
      relations: ['company'],
    });
    if (!employer || employer.company == null) {
      throw new NotFoundException('Employer or company not found');
    }

    if (employer.roleName !== 'EMPLOYER') {
      throw new ConflictException('Only employer can create job post');
    }
    return employer;
  }

  async findPrivateJobPosts(filters: any): Promise<any> {
    const { userId, isUrgent, keyword, ordering, page, pageSize, statusId } =
      filters;
    // Tạo truy vấn với các điều kiện tìm kiếm
    const query = this.jobPostRepository
      .createQueryBuilder('job_post')
      .where('job_post.user.id = :userId', { userId }) // Lỗi: thiếu query. ở đây
      .andWhere('job_post.jobName LIKE :kw', { kw: `%${keyword}%` });
    // Kiểm tra nếu có statusId thì thêm điều kiện vào query

    if (isUrgent) {
      query.andWhere('job_post.isUrgent = :isUrgent', { isUrgent });
    }
    if (statusId) {
      query.andWhere('job_post.status = :statusId', { statusId });
    }
    // Sắp xếp theo ordering
    query
      .orderBy(`job_post.${ordering}`, 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    // Thực hiện truy vấn với `try-catch` để kiểm tra lỗi
    const [results, count] = await query.getManyAndCount();
    // Chuẩn bị dữ liệu trả về
    return {
      count,
      results: results.map((job) => ({
        id: job.id,
        slug: job.slug,
        jobName: job.jobName,
        deadline: job.deadline,
        isUrgent: job.isUrgent,
        status: job.status,
        createAt: job.createAt,
        appliedNumber: 0, // Bạn có thể tính toán số lượng ứng viên ở đây nếu cần
        views: job.views,
        isExpired: new Date(job.deadline) < new Date(), // Kiểm tra xem công việc đã hết hạn chưa
      })),
    };
  }

  async upDateJobPostExpired():Promise<void> {
    await this.jobPostRepository
    .createQueryBuilder()
    .update('JobPost')
    .set({ isExpired: true })
    .where('deadline < :currentDate', { currentDate: new Date() }) // So sánh trực tiếp với ngày hiện tại
    .andWhere('isExpired = false') // Chỉ cập nhật nếu chưa hết hạn
    .execute();
  }

  async findJobPosts(filters: any) {
    const {
      isUrgent,
      careerId,
      keyword,
      ordering,
      page,
      pageSize,
      statusId,
      companyId,
    } = filters;

    await this.upDateJobPostExpired()
   
    // Tạo truy vấn với các điều kiện tìm kiếm
    const query = this.jobPostRepository
      .createQueryBuilder('job_post') // Lỗi: thiếu query. ở đây
      .leftJoinAndSelect('job_post.company', 'company') // Join bảng company
      // .leftJoinAndSelect('job_post.user', 'mobileUser') // Join bảng mobileUser
      .leftJoinAndSelect('job_post.location', 'location') // Join bảng location
      .leftJoinAndSelect('location.city', 'city') // Join bảng city
      .where('job_post.jobName LIKE :kw', { kw: `%${keyword}%` })
      .andWhere('job_post.status = :status', { status: 3 })
      .andWhere('job_post.deadline >= :currentDate', {
        currentDate: new Date().toISOString(),
      });
    if (isUrgent) {
      query.andWhere('job_post.isUrgent = :isUrgent', { isUrgent });
    }

    if (careerId) {
      query.andWhere('job_post.careerId = :careerId', { careerId });
    }

    if (companyId) {
      query.andWhere('company.id = :companyId', { companyId });
    }

    if (statusId) {
      query.andWhere('job_post.status = :statusId', { statusId });
    }
    // Sắp xếp theo ordering
    query
      .orderBy(`job_post.${ordering}`, 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    // Thực hiện truy vấn với `try-catch` để kiểm tra lỗi
    const [results, count] = await query.getManyAndCount();
    // Chuẩn bị dữ liệu trả về
    return {
      count,
      results: results.map((job) => 
        JobPostSavedResponseDto.toResponse(job, false)
      ),
    };
  }

  async findPrivateJobPostsToExport(filters: any): Promise<any> {
    const { userId, isUrgent, keyword, ordering, page, pageSize, statusId } =
      filters;
    // Tạo truy vấn với các điều kiện tìm kiếm
    const query = this.jobPostRepository
      .createQueryBuilder('job_post')
      .where('job_post.user.id = :userId', { userId }) // Lỗi: thiếu query. ở đây
      .andWhere('job_post.jobName LIKE :kw', { kw: `%${keyword}%` });

    if (isUrgent) {
      query.andWhere('job_post.isUrgent = :isUrgent', { isUrgent });
    }
    // Kiểm tra nếu có statusId thì thêm điều kiện vào query
    // Lỗi dấu phẩy ở đây
    if (statusId) {
      query.andWhere('job_post.status = :statusId', { statusId });
    }
    // Sắp xếp theo ordering
    query.orderBy(`job_post.${ordering}`, 'DESC');
    query.skip((page - 1) * pageSize).take(pageSize);

    // Thực hiện truy vấn với `try-catch` để kiểm tra lỗi
    const [results] = await query.getManyAndCount();
    // Chuẩn bị dữ liệu trả về
    return {
      data: results.map((job, index) => ({
        STT: index + 1,
        'Mã Việc Làm': job.id,
        'Chức danh': job.jobName,
        'Ngày Hết Hạn': job.deadline,
        'Ngày Đăng': job.createAt,
        'Số hồ sơ ứng tuyển': 0,
        'Lượt Xem': job.views,
      })),
    };
  }

  async getPrivateJobPostById(jobId: number, userId: string) {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: jobId },
      relations: [
        'location',
        'location.city',
        'location.district',
        'company',
        'user',
        'career',
      ],
    });
    if (!jobPost || jobPost.user.id !== userId) {
      throw new NotFoundException('Not found');
    }

    return JobPostResponseDto.toResponse(jobPost);
  }

  async updatePrivateJobPostById(
    jobId: number,
    userId: string,
    updateJobPostDto: CreateJobPostDto,
  ) {
    // Tìm job post hiện tại
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: jobId },
      relations: [
        'location',
        'location.city',
        'location.district',
        'company',
        'user',
        'career',
      ],
    });

    if (!jobPost || jobPost.user.id !== userId) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Kiểm tra và cập nhật career nếu có thay đổi
    if (updateJobPostDto.career) {
      const career = await this.careerRepository.findOne({
        where: { id: +updateJobPostDto.career },
      });
      if (!career) {
        throw new NotFoundException('Không tìm thấy ngành nghề');
      }
      jobPost.career = career;
    }

    // Cập nhật location nếu có thay đổi
    if (updateJobPostDto.location) {
      const updatedLocation = {
        city: { id: updateJobPostDto.location.city },
        district: { id: updateJobPostDto.location.district },
        address: updateJobPostDto.location.address,
        lat: updateJobPostDto.location.lat,
        lng: updateJobPostDto.location.lng,
      };

      await this.locationRepository.update(
        jobPost.location.id,
        updatedLocation,
      );
    }

    // Cập nhật slug nếu tên job thay đổi
    if (updateJobPostDto.jobName !== jobPost.jobName) {
      updateJobPostDto.slug = await this.generateSlug(updateJobPostDto.jobName);
    }

    // Cập nhật các thông tin khác
    Object.assign(jobPost, updateJobPostDto);

    const updatedJobPost = await this.jobPostRepository.save(jobPost);

    return JobPostResponseDto.toResponse(updatedJobPost);
  }

  async findJobPostBySlug(slug: string) {
    const jobPost = await this.jobPostRepository.findOne({
      where: { slug },
      relations: [
        'location',
        'location.city',
        'location.district',
        'company',
        'user',
        'career',
      ],
    });
    return jobPost;
  }

  async getPublicJobPost(slug: string, headers: any) {
    const jobPost = await this.findJobPostBySlug(slug);
    const userId = await this.getUserByHeader(headers);
    let isApplied = false;
    let isSaved = null;
    if (userId) {
      isSaved = (await this.checkIsSavedJobPost(slug, userId)).isSaved;
      const appliedActivity = await this.jobPostActivityRepository.findOne({
        where: {
          user: {id: userId},
          jobPost: {id: jobPost.id},

        },
      });
      isApplied = !!appliedActivity;
    }

    // Save the job post
    const savedJobPost = await this.jobPostRepository.save(jobPost);
    // Increment the views count
    savedJobPost.views++;
    await this.jobPostRepository.save(savedJobPost);

    return JobPostResponseDto.toResponse({ ...jobPost, isSaved, isApplied });
  }

  async checkIsSavedJobPost(slug: string, userId: number) {
    const jobPost = await this.findJobPostBySlug(slug);
    const isSaved = await this.jobPostSavedRepository.findOne({
      where: {
        user: { id: userId.toString() },
        jobPost: { id: jobPost.id },
      },
    });
    return { isSaved: !!isSaved, savedId: isSaved?.id };
  }

  async savedJobPost(slug: string, userId: number) {
    const jobPost = await this.findJobPostBySlug(slug);
    const { isSaved, savedId } = await this.checkIsSavedJobPost(slug, userId);

    if (isSaved) {
      await this.jobPostSavedRepository.delete(savedId);
    } else {
      await this.jobPostSavedRepository.save({
        user: { id: userId.toString() },
        jobPost: { id: jobPost.id },
      });
    }

    return !isSaved;
  }

  async getUserByHeader(headers: any) {
    let userId = null;
    const authHeader = headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decodedToken = this.jwtService.verify(token);
        userId = decodedToken.id;
      } catch (error) {
        console.log(error);
        userId = null; // Token không hợp lệ hoặc hết hạn
      }
    }
    return userId;
  }



  async createJobPostActivity(createJobPostActivityDto: CreateJobPostActivityDto): Promise<JobPostActivity> {
    const { email, fullName, job_post, phone, resume } = createJobPostActivityDto;
  
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
  
    const resumeEntity = await this.resumeRepository.findOne({ where: { id: resume } });
    if (!resumeEntity) {
      throw new Error('Resume not found');
    }
  
    const jobPost = await this.jobPostRepository.findOne({ where: { id: job_post } });
    if (!jobPost) {
      throw new Error('Job post not found');
    }
  
    const jobPostActivity = new JobPostActivity();
    jobPostActivity.fullName = fullName;
    jobPostActivity.email = email;
    jobPostActivity.phone = phone;
    jobPostActivity.user = user;
    jobPostActivity.resume = resumeEntity;
    jobPostActivity.jobPost = jobPost;
  
    return this.jobPostActivityRepository.save(jobPostActivity);
  }


  async getJobPostActivities(page: number, pageSize: number, userId: string) {
    const skip = (page - 1) * pageSize;
    // Lấy danh sách hoạt động kèm quan hệ liên quan
    const [activities, totalCount] = await this.jobPostActivityRepository.findAndCount({
      where: {
        user: {id: userId}
      },
      skip,
      take: pageSize,
      relations: [
        'jobPost',
        'jobPost.company',
        'user',
        'jobPost.location',
        'resume',
        'jobPost.location.city'
      ],
      order: { createAt: 'DESC' },
    });
    
    // Sử dụng DTO để định dạng kết quả
    const results = activities.map((activity) => JobActivityResponseDto.toResponse(activity));
  
    return {
      count: totalCount,
      results,
    };
  }

  async getJobPostNotifications(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [notifications, totalCount] = await this.jobPostNotificationRepository.findAndCount({
      skip,
      take: pageSize,
      relations: ['career', 'city'],
      order: { createAt: 'DESC' },
    });



    const results = notifications.map((notification) =>
      JobPostNotificationResponseDto.toResponse(notification),
    );

    return {
      count: totalCount,
      results,
    };
  }

  async getSavedJobPosts(page: number, pageSize: number, userId: number) {
    const skip = (page - 1) * pageSize;
    const currentDate = new Date();
    // Lấy danh sách các JobPost đã lưu
    const [savedJobs, totalCount] = await this.jobPostSavedRepository.findAndCount({
      where: { user: { id: userId.toString() },
        jobPost: {
        deadline: MoreThanOrEqual(currentDate), // Deadline >= hôm nay
        status: 3, // Chỉ lấy công việc đang hoạt động
      },},
      relations: ['jobPost', 'jobPost.company', 'user', 'jobPost.location', 'jobPost.location.city'],
      skip,
      take: pageSize,
      order: { createAt: 'DESC' },
    });
  
    // Định dạng dữ liệu trả về
    const results = savedJobs.map((savedJob) => {
      const jobPost = savedJob.jobPost;
      return JobPostSavedResponseDto.toResponse(jobPost, true); // isApplied = true
    });
  
    return {
      count: totalCount,
      results,
    };
  }
  


  async createJobPostNotification(
    createJobPostNotificationDto: CreateJobPostNotificationDto,
    userId: string
  ) {
    const { jobName, position, experience, salary, frequency, career, city } = createJobPostNotificationDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch related entities (career and city) in parallel
    const [careerEntity, cityEntity] = await Promise.all([
      this.careerRepository.findOne({ where: { id: career } }),
      this.cityRepository.findOne({ where: { id: city } }),
    ]);

    // Check if the entities exist
    if (!careerEntity) throw new NotFoundException('Career not found');
    if (!cityEntity) throw new NotFoundException('City not found');

    // Create and save the notification
    const notification = this.jobPostNotificationRepository.create({
      user: { id: userId }, // Ensure user ID is set correctly
      jobName,
      position,
      experience,
      salary,
      frequency,
      career: careerEntity,
      city: cityEntity,
    });

    const savedNotification = await this.jobPostNotificationRepository.save(notification);

    // Return the result in the required format
    return {
      id: savedNotification.id,
      jobName: savedNotification.jobName,
      salary: savedNotification.salary,
      frequency: savedNotification.frequency,
      career: savedNotification.career.id,
      city: savedNotification.city.id,
    };
  }

  async toggleActiveStatus(id: number): Promise<JobPostNotification> {
    const notification = await this.jobPostNotificationRepository.findOne({ where: { id } });

    if (!notification) {
      throw new NotFoundException('Job post notification not found');
    }

    notification.isActive = !notification.isActive;
    return this.jobPostNotificationRepository.save(notification);
  }

  async getEmployerJobPostsActivity(
    userId: number,
    filters: any,
    page: number,
    pageSize: number,
  ) {
    const skip = (page - 1) * pageSize;
  
    const queryBuilder = this.jobPostActivityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.jobPost', 'jobPost')
      .leftJoinAndSelect('activity.resume', 'resume')
      .where('activity.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('jobPost.userId = :userId', { userId });
    // Apply filters if provided
    if (filters.academicLevelId) {
      queryBuilder.andWhere('jobPost.academicLevel = :academicLevelId', { academicLevelId: filters.academicLevelId });
    }
    if (filters.careerId) {
      queryBuilder.andWhere('jobPost.careerId = :careerId', { careerId: filters.careerId });
    }
    if (filters.cityId) {
      queryBuilder.andWhere('jobPost.location = :cityId', { cityId: filters.cityId });
    }
    if (filters.experienceId) {
      queryBuilder.andWhere('jobPost.experience = :experienceId', { experienceId: filters.experienceId });
    }
    if (filters.genderId) {
      queryBuilder.andWhere('jobPost.genderRequired = :genderId', { genderId: filters.genderId });
    }
    if (filters.jobPostId) {
      queryBuilder.andWhere('jobPost.id = :jobPostId', { jobPostId: filters.jobPostId });
    }
    if (filters.jobTypeId) {
      queryBuilder.andWhere('jobPost.jobType = :jobTypeId', { jobTypeId: filters.jobTypeId });
    }
    if (filters.maritalStatusId) {
      queryBuilder.andWhere('jobPost.maritalStatus = :maritalStatusId', { maritalStatusId: filters.maritalStatusId });
    }
    if (filters.positionId) {
      queryBuilder.andWhere('jobPost.position = :positionId', { positionId: filters.positionId });
    }
    if (filters.status) {
      queryBuilder.andWhere('activity.status = :status', { status: filters.status });
    }
    if (filters.typeOfWorkplaceId) {
      queryBuilder.andWhere('jobPost.typeOfWorkplace = :typeOfWorkplaceId', { typeOfWorkplaceId: filters.typeOfWorkplaceId });
    }
  
    const [activities, totalCount] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('activity.createAt', 'DESC')
      .getManyAndCount();
  
    const results = activities.map((activity) =>
      JobPostActivityResponseDto.toResponse(activity),
    );
  
    return {
      count: totalCount,
      results,
    };
  }
  
  async updateApplicationStatus(activityId: number, status: number): Promise<void> {
    // Tìm bản ghi theo `activityId`
    const activity = await this.jobPostActivityRepository.findOne({
      where: { id: activityId, isDeleted: false }, // Chỉ cập nhật nếu chưa bị xóa
    });
    activity.status = status;
    await this.jobPostActivityRepository.save(activity);
  }


  async getJobSeekerTotalView(userId: string): Promise<any> {
    // Lấy danh sách các resume của user
    const resumes = await this.resumeRepository.find({
      where: { user: { id: userId } },
      select: ['id'], // Chỉ cần lấy ID
    });
    
    // Lấy danh sách ID các resume
    const resumeIds = resumes.map((resume) => resume.id);
    // Tính tổng số view từ bảng ResumeViewed
    const totalViewRaw = await this.resumeViewedRepository
    .createQueryBuilder('resumeViewed')
    .where('resumeViewed.resumeId IN (:...resumeIds)', { resumeIds })
    .select('SUM(resumeViewed.views)', 'totalView') // Aggregate query để tính tổng
    .getRawOne();
    
    return Number(totalViewRaw?.totalView) || 0

  }

  async getJobSeekerTotalFollowed(userId: string): Promise<number> {
    const resumes = await this.resumeRepository.find({
      where: { user: { id: userId } },
      select: ['id'], // Chỉ cần lấy ID
    });

    // Lấy danh sách ID các resume
    const resumeIds = resumes.map((resume) => resume.id);
    const totalFollowedRaw = await this.resumeSavedRepository
      .createQueryBuilder('resumeSaved')
      .where('resumeSaved.resumeId IN (:...resumeIds)', { resumeIds })
      .select('COUNT(resumeSaved.id)', 'totalFollowed') // Aggregate query để tính tổng
      .getRawOne()
    return Number(totalFollowedRaw?.totalFollowed) || 0;
  }

  async getJobSeekerTotalSaved(userId: string): Promise<any> {
    const resumes = await this.resumeRepository.find({
      where: { user: { id: userId } },
      select: ['id'],
    });
    const resumeIds = resumes.map((resume) => resume.id);

    const totalSavedRaw = await this.resumeViewedRepository
    .createQueryBuilder('resumeSaved')
    .where('resumeSaved.resumeId IN (:...resumeIds)', { resumeIds })
    .select('COUNT(resumeSaved.id)', 'totalSaved') // Aggregate query để tính tổng
    .getRawOne();
    return Number(totalSavedRaw?.totalSaved) || 0
  }

  async getJobSeekerGeneralStatistics(userId: string): Promise<any> {
    // 1. Tính totalApply từ bảng JobPostActivity (status = 2)
    const totalApply = await this.jobPostActivityRepository.count({
      where: { user: { id: userId }},
    });

    // 2. Tìm tất cả resumeIds của user
    const totalSave =  await this.getJobSeekerTotalSaved(userId)
    // 4. Tính totalView từ ResumeViewed
    const totalView = await this.getJobSeekerTotalView(userId)
    // 5. Tính totalFollow từ CompanyFollowed
    const totalFollow = await this.getJobSeekerTotalFollowed(userId)
    // 6. Trả về dữ liệu
    return {
      errors: {},
      data: {
        totalApply,
        totalSave,
        totalView,
        totalFollow,
      },
    };
  }

  async getJobSeekerActivityStatistics(userId: string): Promise<any> {
    try {
      // Lấy các tháng trong khoảng từ tháng hiện tại đến cuối năm sau
      const labels = this.generateMonthlyLabels();
      const months = labels.map((label) => label.split('-')[1]); // Chỉ lấy phần tháng (e.g., "T12")

      // 1. Lấy dữ liệu "Việc đã ứng tuyển"
      const appliedData = await this.getMonthlyAppliedJobs(userId, labels);
  
      // // 2. Lấy dữ liệu "Việc đã lưu"
      const savedJobsData = await this.getMonthlySavedJobs(userId, labels);
  
      // // 3. Lấy dữ liệu "Công ty đang theo dõi"
      const followedCompaniesData = await this.getMonthlyFollowedCompanies(userId, labels);
  
      return {
        title1: 'Việc đã ứng tuyển',
        title2: 'Việc đã lưu',
        title3: 'Công ty đang theo dõi',
        labels,
        data1: appliedData,
        data2: savedJobsData,
        data3: followedCompaniesData,
      };
    } catch (error) {
      console.error('Error in getJobSeekerActivityStatistics:', error);
      throw new Error('Failed to calculate activity statistics.');
    }
  }
  
  

  async generateSlug(companyName: string): Promise<string> {
    // Tạo slug cơ bản từ tên công ty
    let slug = companyName
      .toLowerCase()
      .normalize('NFD') // Loại bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các ký tự dấu
      .replace(/[^a-z0-9 ]/g, '') // Giữ lại chữ cái và số
      .trim()
      .replace(/\s+/g, '-'); // Chuyển khoảng trắng thành dấu "-"

    // Kiểm tra xem slug đã tồn tại trong cơ sở dữ liệu chưa
    let isSlugExist = await this.jobPostRepository.findOne({ where: { slug } });
    // Nếu slug đã tồn tại, thêm hậu tố số vào
    let counter = 1;
    while (isSlugExist) {
      const match = slug.match(/-(\d+)$/); // Kiểm tra xem slug có kết thúc bằng một số không

      if (match) {
        // Nếu có, cộng thêm 1 vào số đó
        counter = parseInt(match[1], 10) + 1;
        slug = slug.replace(/-(\d+)$/, `-${counter}`); // Cập nhật slug với số mới
      } else {
        // Nếu không có số, thêm "-1" vào cuối
        slug = `${slug}-1`;
      }

      // Kiểm tra lại xem slug có tồn tại không
      isSlugExist = await this.jobPostRepository.findOne({ where: { slug } });
    }

    return slug;
  }

    generateMonthlyLabels(): string[] {
      const labels = [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear() - 1
    
      for (let i = 0; i < 13; i++) {
        const month = (currentMonth + i) % 12 + 1; // Tính tháng (1-12)
        const year = currentYear + Math.floor((currentMonth + i) / 12); // Tính năm
        labels.push(`T${month}-${year}`);
      }
    
      return labels;
    }

    async getMonthlyAppliedJobs(userId: string, months: string[]): Promise<number[]> {
      const appliedJobs = await this.jobPostActivityRepository
        .createQueryBuilder('jobPostActivity')
        .select("('T' || EXTRACT(MONTH FROM jobPostActivity.createAt)::TEXT || '-' || EXTRACT(YEAR FROM jobPostActivity.createAt)::TEXT)", 'monthYear') // Format thành T1-YYYY
        .addSelect('COUNT(jobPostActivity.id)', 'total') // Đếm số lượng theo tháng
        .where('jobPostActivity.userId = :userId', { userId }) // Điều kiện userId
        // .andWhere('jobPostActivity.status = :status', { status: 2 }) // Điều kiện status = 2
        .groupBy("EXTRACT(MONTH FROM jobPostActivity.createAt), EXTRACT(YEAR FROM jobPostActivity.createAt)") // Nhóm theo tháng-năm
        .getRawMany();


      // Xử lý dữ liệu để khớp với các tháng trong `months`
      const result = months.map((month) => {
        const match = appliedJobs.find((job) => job.monthYear === month); // So sánh đúng định dạng
        return match ? Number(match.total) : 0;
      });
    
      return result;
    }
    
  

  async getMonthlySavedJobs(userId: string, months: string[]): Promise<number[]> {
    const savedJobs = await this.jobPostSavedRepository
      .createQueryBuilder('jobSaved') // Alias là 'jobSaved'
      .select("('T' || EXTRACT(MONTH FROM jobSaved.createAt)::TEXT || '-' || EXTRACT(YEAR FROM jobSaved.createAt)::TEXT)", 'monthYear') // Format thành T1-YYYY
      .addSelect('COUNT(jobSaved.id)', 'total')
      .where('jobSaved.userId = :userId', { userId })
      .groupBy("EXTRACT(MONTH FROM jobSaved.createAt), EXTRACT(YEAR FROM jobSaved.createAt)") // Nhóm theo tháng-năm
      .getRawMany();

    const result = months.map((month) => {
      const match = savedJobs.find((job) => job.monthYear === month);
      return match ? Number(match.total) : 0;
    });
  
    return result;
  }
  

  async getMonthlyFollowedCompanies(userId: string, months: string[]): Promise<number[]> {
    // 1. Lấy danh sách resumeIds của user
    const resumes = await this.resumeRepository.find({
      where: { user: { id: userId } },
      select: ['id'], // Chỉ cần lấy ID
    });
  
    const resumeIds = resumes.map((resume) => resume.id);
  

  
    // 2. Lấy dữ liệu theo tháng từ ResumeSaved
    const followedCompanies = await this.resumeSavedRepository
      .createQueryBuilder('resumeSaved')
      .select("('T' || EXTRACT(MONTH FROM resumeSaved.createAt)::TEXT || '-' || EXTRACT(YEAR FROM resumeSaved.createAt)::TEXT)", 'monthYear') // Format thành T1-YYYY
      .addSelect('COUNT(resumeSaved.id)', 'total') // Đếm số lượng
      .where('resumeSaved.resumeId IN (:...resumeIds)', { resumeIds }) // Điều kiện lọc theo resumeId
      .groupBy("EXTRACT(MONTH FROM resumeSaved.createAt), EXTRACT(YEAR FROM resumeSaved.createAt)") // Nhóm theo tháng-năm
      .getRawMany();
  
    // 3. Khớp dữ liệu theo `months` được truyền vào
    const result = months.map((month) => {
      const match = followedCompanies.find((follow) => follow.monthYear === month);
      return match ? Number(match.total) : 0;
    });
  
    return result;
  }
  
  async getEmployerGeneralStatistics(userId: string): Promise<any> {
    // Cập nhật trạng thái isExpired = true nếu deadline < ngày hiện tại
    await this.upDateJobPostExpired()

    // 1. Total Job Posts
    const totalJobPost = await this.jobPostRepository.count({
      where: { user: { id: userId } },
    });
  
    // 2. Total Job Posting Pending Approval
    const totalJobPostingPendingApproval = await this.jobPostRepository.count({
      where: { user: { id: userId }, status: 1 },
    });
  
    // 3. Total Job Post Expired
    const totalJobPostExpired = await this.jobPostRepository.count({
      where: { user: { id: userId }, isExpired: true },
    });
  
    // 4. Total Apply
    const totalApply = await this.jobPostActivityRepository
      .createQueryBuilder('activity')
      .leftJoin('activity.jobPost', 'jobPost')
      .where('jobPost.userId = :userId', { userId })
      .andWhere('activity.isDeleted = :isDeleted', { isDeleted: false })
      .getCount();
  
    return {
      errors: {},
      data: {
        totalJobPost,
        totalJobPostingPendingApproval,
        totalJobPostExpired,
        totalApply,
      },
    };
  }
  
  async getEmployerRecruitmentStatistics(
    employerId: string, // Đây là userId của nhà tuyển dụng
    startDate: string,
    endDate: string,
  ): Promise<{ label: string; data: number[] }[]> {
    const statuses = [
      { label: 'Chờ xác nhận', status: 1 },
      { label: 'Đã liên hệ', status: 2 },
      { label: 'Đã test', status: 3 },
      { label: 'Đã phỏng vấn', status: 4 },
      { label: 'Trúng tuyển', status: 5 },
      { label: 'Không trúng tuyển', status: 6 },
    ];
  
    const result = [];
  
    for (const { label, status } of statuses) {
      const count = await this.jobPostActivityRepository
        .createQueryBuilder('activity')
        .leftJoin('activity.jobPost', 'jobPost') // Liên kết bảng JobPost
        .where('activity.status = :status', { status }) // Điều kiện status
        .andWhere('jobPost.userId = :employerId', { employerId }) // Lọc theo userId của nhà tuyển dụng
        .andWhere('activity.createAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        }) // Lọc theo khoảng thời gian
        .getCount();
  
      result.push({ label, data: [count] });
    }
  
    return result;
  }
  
  async getRecruitmentStatisticsByRank(
    employerId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    try {
      // Truy vấn dữ liệu
      const rawData = await this.jobPostActivityRepository
        .createQueryBuilder('activity')
        .leftJoin('activity.resume', 'resume') // Liên kết với bảng Resume
        .leftJoin('activity.jobPost', 'jobPost') // Liên kết với JobPost để lấy employerId
        .where('jobPost.userId = :employerId', { employerId }) // Lọc theo userId của nhà tuyển dụng
        .andWhere('activity.createAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        }) // Lọc theo ngày
        .select('resume.academicLevel', 'academicLevel') // Lấy cột AcademicLevel từ Resume
        .addSelect('COUNT(activity.id)', 'total') // Đếm số lượng hoạt động
        .groupBy('resume.academicLevel') // Nhóm theo cấp học vấn
        .getRawMany();
  
      // Map kết quả thành định dạng yêu cầu
      const academicLevels = [
        { id: 1, name: 'Trên Đại học' },
        { id: 2, name: 'Đại học' },
        { id: 3, name: 'Cao đẳng' },
        { id: 4, name: 'Trung cấp' },
        { id: 5, name: 'Trung học' },
        { id: 6, name: 'Chứng chỉ nghề' },
      ];
  
      const data = academicLevels.map((level) => {
        const match = rawData.find((item) => item.academicLevel == level.id);
        return match ? Number(match.total) : 0;
      });
  
      return {

          data,
          labels: academicLevels.map((level) => level.name),
          backgroundColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],

      };
    } catch (error) {
      console.error('Error in getRecruitmentStatisticsByRank:', error.message);
      console.error('Stack Trace:', error.stack);
  
      return {
        errors: {
          message: 'An error occurred while processing the request.',
        },
        data: null,
      };
    }
  }
  
  async getEmployerApplicationStatistics(
    employerId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const start = moment(startDate);
    const end = moment(endDate);
  
    const daysDiff = end.diff(start, 'days') + 1;
  

    // Generate labels (dates between startDate and endDate)
    const labels = [];
    for (let i = 0; i < daysDiff; i++) {
      labels.push(start.clone().add(i, 'days').format('DD/MM'));
    }
  
    // Initialize data arrays
    const data1 = new Array(daysDiff).fill(0); // Job posts
    const data2 = new Array(daysDiff).fill(0); // Jobs with applications
  
    // Query all job posts by employerId
    const allJobPosts = await this.jobPostRepository.find({
      where: { user: {id: employerId} },
      select: ['id', 'createAt', 'deadline', 'isExpired'],
    });
  
    // Calculate data1 for each day
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = start.clone().add(i, 'days');
      data1[i] = allJobPosts.filter(
        (job) =>
          moment(job.createAt).isSameOrBefore(currentDate) && // Created before or on the current date
          (!job.deadline || moment(job.deadline).isSameOrAfter(currentDate)) && // Not expired by deadline
          !job.isExpired, // Not marked as expired
      ).length;
    }
  
    // Query job post activities grouped by jobPost ID and date
    const jobPostActivities = await this.jobPostActivityRepository
      .createQueryBuilder('activity')
      .leftJoin('activity.jobPost', 'jobPost')
      .select('DATE(activity.createAt)', 'date')
      .addSelect('COUNT(DISTINCT activity.jobPostId)', 'count') // Count unique jobPost IDs
      .where('jobPost.userId = :employerId', { employerId })
      .andWhere('activity.createAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(activity.createAt)')
      .getRawMany();
  
    // Map jobs with applications to data2
    jobPostActivities.forEach((activity) => {
      const index = labels.indexOf(moment(activity.date).format('DD/MM'));
      if (index !== -1) {
        data2[index] = parseInt(activity.count, 10); // Number of unique jobs with applications
      }
    });
  
    // Return response
    return {
      errors: {},
      data: {
        title1: 'Việc làm',
        title2: 'Việc làm có ứng tuyển',
        labels,
        data1,
        data2,
        backgroundColor1: 'rgb(75, 192, 192)',
        backgroundColor2: 'red',
      },
    };
  }

  async getEmployerCandidateStatistics(
    employerId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    // Validate dates
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
  
    // Generate labels (days from startDate to endDate)
    const daysDiff = end.diff(start, 'days') + 1;
    const labels = Array.from({ length: daysDiff }, (_, i) =>
      start.clone().add(i, 'days').format('DD/MM'),
    );
  
    // Get all jobPost IDs belonging to the employer
    const jobPostIds = await this.jobPostRepository
      .createQueryBuilder('jobPost')
      .select('jobPost.id', 'id')
      .where('jobPost.userId = :employerId', { employerId })
      .getRawMany();
  
    if (jobPostIds.length === 0) {
      // If no job posts, return empty data
      return {
        errors: {},
        data: {
          title1: moment().year(), // Current year
          labels,
          data1: new Array(daysDiff).fill(0),
          borderColor1: 'rgb(53, 162, 235)',
          backgroundColor1: 'rgba(53, 162, 235, 0.5)',
        },
      };
    }
  
    // Extract IDs from jobPostIds
    const jobPostIdList = jobPostIds.map((item) => item.id);
  
    // Query job post activities grouped by day
    const activities = await this.jobPostActivityRepository
      .createQueryBuilder('activity')
      .select(
        "TO_CHAR(activity.createAt AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')",
        'date',
      )
      .addSelect('COUNT(activity.id)', 'count') // Count each application
      .where('activity.jobPostId IN (:...jobPostIdList)', { jobPostIdList })
      .andWhere('activity.createAt BETWEEN :startDate AND :endDate', {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      })
      .groupBy('date')
      .getRawMany();
  
    // Map activities to data array
    const data = new Array(daysDiff).fill(0);
    activities.forEach((activity) => {
      const index = labels.indexOf(
        moment(activity.date, 'YYYY-MM-DD').format('DD/MM'),
      );
      if (index !== -1) {
        data[index] = parseInt(activity.count, 10);
      }
    });
  
    // Return response
    return {
      errors: {},
      data: {
        title1: moment().year(), // Current year
        labels,
        data1: data,
        borderColor1: 'rgb(53, 162, 235)',
        backgroundColor1: 'rgba(53, 162, 235, 0.5)',
      },
    };
  }
  
  async getSuggestedJobPosts(page: number, pageSize: number, userId: string) {
    // Lấy Resume đang active của user
    const activeResume = await this.resumeRepository.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['career', 'city'],
    });
  
    if (!activeResume) {
      return {
        errors: {},
        data: {
          count: 0,
          results: [],
        }
      };
    }
  
    const { career, city } = activeResume;
  
    // Lọc JobPost theo career và city
    const [jobPosts, count] = await this.jobPostRepository.findAndCount({
      where: {
        career: { id: career?.id },
        location: { city: { id: city?.id } },
        isExpired: false,
        status: 3,
      },
      relations: ['company', 'company.user', 'location.city'],
      take: pageSize,
      skip: (page - 1) * pageSize,
      order: { isHot: 'DESC', isUrgent: 'DESC', createAt: 'DESC' },
    });
  
    // Sử dụng JobPostSavedResponseDto để định dạng dữ liệu
    const results = jobPosts.map((jobPost) => JobPostSavedResponseDto.toResponse(jobPost, false));
  
    return {
      errors: {},
      data: {
        count,
        results,
      },
    };
  }

  async deletePrivateJobPost(jobPostId: number, userId: string) {
    const jobPost = await this.jobPostRepository.findOne({
      where: {
        id: jobPostId,
        user: { id: userId }
      }
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found or you do not have permission to delete it');
    }

    await this.jobPostRepository.remove(jobPost);
    
    return {
      errors: {},
      data: {
        message: 'Job post deleted successfully'
      }
    };
  }

  async employeeSendEmail(
    employeeSendEmailDto: EmployeeSendEmailDto,
    activityId: number,
    employeeEmail: string,
  ) {
    const activity = await this.jobPostActivityRepository.findOne({
      where: { id: activityId, isDeleted: false },
      relations: ['jobPost', 'jobPost.company'], 
    });
    // Cập nhật trạng thái isSendMail
      await this.nodemailerService.employeeSendEmail(employeeSendEmailDto, employeeEmail, activity.jobPost.company.companyName, activity.jobPost.jobName, activity.jobPost.slug,  activity.jobPost.company.slug);
      activity.isSendMail = true;
      await this.jobPostActivityRepository.save(activity);
  }
  
  async getAllJobPost() {
    return await this.jobPostRepository.find({
      relations: ['company'],
      select: {
      company: {
        companyImageUrl   : true,
        companyName: true
      }
      }
    });
  }

}
