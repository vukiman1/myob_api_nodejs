import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  create(createJobDto: CreateJobDto) {
    return 'This action adds a new job';
  }

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
