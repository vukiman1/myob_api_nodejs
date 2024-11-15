import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Location } from '../common/entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobPostDto, JobPostResponseDto } from './dto/job-post.dto';
import { JobPost } from './entities/job-post.entity';
import { User } from '../user/entities/user.entity';
import { Career } from '../common/entities/carrer.entity';
import { UserModule } from '../user/user.module';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Career)
    private careerRepository: Repository<Career>,
) {}



  async createPrivateJobPost(createJobPostDto: CreateJobPostDto, email: string) {
    const user = await this.findEmployer(email)
    const career = await this.careerRepository.findOne({ where: { id: +createJobPostDto.career } });
    if (!career) {
      throw new NotFoundException("Career not found");
    }

    const newLocation = this.locationRepository.create({
      city: { id: createJobPostDto.location.city },
      district: { id: createJobPostDto.location.district },
      address: createJobPostDto.location.address,
    });

    const savedLocation = await this.locationRepository.save(newLocation);

    createJobPostDto.slug = await this.generateSlug(createJobPostDto.jobName) || "no-name";

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
      relations: ["company"]
  });
    if (!employer || employer.company == null) {
      throw new NotFoundException("Employer or company not found");
    }

    if (employer.roleName !== "EMPLOYER") {
      throw new ConflictException("Only employer can create job post");
    }
    return employer
  }



  async findJobPosts(filters: any): Promise<any> {
    const { isUrgent , keyword , ordering , page , pageSize , statusId} = filters;
    // Tạo truy vấn với các điều kiện tìm kiếm
    const query = this.jobPostRepository.createQueryBuilder('job_post');
    // Thêm điều kiện lọc
    query.andWhere('job_post.isUrgent = :isUrgent', { isUrgent });
    if (keyword) {
        query.andWhere('job_post.jobName LIKE :kw', { kw: `%${keyword}%` });
    }
    if (statusId) query.andWhere('job_post.status = :statusId', { statusId });
    // Sắp xếp
    if (ordering) {
      query.orderBy(`job_post.${ordering === 'createAt' ? 'createdAt' : ordering}`, 'DESC');
  }
    // Phân trang
    query.skip((page - 1) * pageSize).take(pageSize);
    // Thực hiện truy vấn với `try-catch` để kiểm tra lỗi
    const [results, count] = await query.getManyAndCount();
        // Chuẩn bị dữ liệu trả về
      return {
          count,
          results: results.map(job => ({
              id: job.id,
              slug: job.slug,
              jobName: job.jobName,
              deadline: job.deadline,
              isUrgent: job.isUrgent,
              status: job.status,
              createAt: job.createdAt,
              appliedNumber: 0,
              views: job.views,
              isExpired: new Date(job.deadline) < new Date(),
          })),
      };
}


async findJobPostsToExport(filters: any): Promise<any> {
  const { isUrgent, keyword , ordering , page , pageSize , statusId} = filters;
  // Tạo truy vấn với các điều kiện tìm kiếm
  const query = this.jobPostRepository.createQueryBuilder('job_post');
  // Thêm điều kiện lọc
  query.andWhere('job_post.isUrgent = :isUrgent', { isUrgent });
  if (keyword) {
      query.andWhere('job_post.jobName LIKE :kw', { kw: `%${keyword}%` });
  }
  if (statusId) query.andWhere('job_post.status = :statusId', { statusId });
  // Sắp xếp
  if (ordering) {
    query.orderBy(`job_post.${ordering === 'createAt' ? 'createdAt' : ordering}`, 'DESC');
}
  // Phân trang
  query.skip((page - 1) * pageSize).take(pageSize);
  // Thực hiện truy vấn với `try-catch` để kiểm tra lỗi
  const [results, count] = await query.getManyAndCount();
      // Chuẩn bị dữ liệu trả về
    return {      
        data: results.map((job, index) => ({
            "STT": index + 1,
            "Mã Việc Làm": job.id,
            "Chức danh": job.jobName,
            "Ngày Hết Hạn": job.deadline,
            "Ngày Đăng": job.createdAt,
            "Số hồ sơ ứng tuyển": 0,
            "Lượt Xem": job.views,
        })),
    };
}

  async getPrivateJobPostById(jobId: number) {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: jobId },
      relations: ['location', 'location.city', 'location.district', 'company']
    });
    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }
    return JobPostResponseDto.toResponse(jobPost)
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
}
