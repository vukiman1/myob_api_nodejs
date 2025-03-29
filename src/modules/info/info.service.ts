import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../common/entities/location.entity';
import { CompanyResponseDto, UpdateCompanyDto } from './dto/company.dto';
import { City } from '../common/entities/city.entity';
import { District } from '../common/entities/district.entity';
import slugify from 'slugify';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CompanyImage } from './entities/company-image.entity';
import { CompanyFollowed } from './entities/company-followed.entity';
import { JwtService } from '@nestjs/jwt';
import { JobPost } from '../job/entities/job-post.entity';
import { JobSeekerProfile } from './entities/job_seeker_profle.entities';
import { Resume } from './entities/resume.entity';
import { ExperiencesDetail } from './entities/experiences-detail.entity';
import { EducationDetail } from './entities/educations-detail.entity';
import { LanguageSkills } from './entities/language-skills.entity';
import { AdvancedSkills } from './entities/advanced-skills.entity';
import { CertificatesDetail } from './entities/certificates-detail.entity';
import { promises } from 'dns';
import { AuthService } from '../auth/auth.service';
import { Career } from '../common/entities/carrer.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { FollowedCompanyResponseDto } from './dto/company-followed.dto';
import { ResumeResponseDto } from './dto/resume.dto';
import { ResumeSaved } from './entities/resume-saved.entity';
import { JobPostActivity } from '../job/entities/job-post-activity.entity';
import { ResumeViewed } from './entities/resume-viewed.entity';
import moment from 'moment';
import { NodemailerService } from '../nodemailer/nodemailer.service';


@Injectable()
export class InfoService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private nodemailerService: NodemailerService,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyImage)
    private companyImageRepository: Repository<CompanyImage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(CompanyFollowed)
    private companyFollowedRepository: Repository<CompanyFollowed>,
    @InjectRepository(JobSeekerProfile)
    private jobSeekerProfileRepository: Repository<JobSeekerProfile>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeSaved)
    private resumeSavedRepository: Repository<ResumeSaved>,
    @InjectRepository(Career)
    private careerRepository: Repository<Career>,
    @InjectRepository(ExperiencesDetail)
    private experiencesDetailRepository: Repository<ExperiencesDetail>,

    @InjectRepository(EducationDetail)
    private educationDetailRepository: Repository<EducationDetail>,

    @InjectRepository(LanguageSkills)
    private languageSkillsRepository: Repository<LanguageSkills>,

    @InjectRepository(AdvancedSkills)
    private advancedSkillsRepository: Repository<AdvancedSkills>,

    @InjectRepository(CertificatesDetail)
    private certificatesDetailRepository: Repository<CertificatesDetail>,
    @InjectRepository(JobPostActivity)
    private jobPostActivityRepository: Repository<JobPostActivity>,
    @InjectRepository(ResumeViewed)
    private resumeViewedRepository: Repository<ResumeViewed>,
  ) {}

  async getCompanyInfo(email: string) {
    const company = await this.findCompanyByEmail(email);
    return CompanyResponseDto.toResponse(company);
  }

  async getCompanyTop() {
    const query = this.companyFollowedRepository
      .createQueryBuilder('companyFollowed')
      // Tham gia với bảng 'company' để lấy thông tin của công ty
      .innerJoin('companyFollowed.company', 'company')
      .select('company.id', 'id')
      .addSelect('company.slug', 'slug')
      .addSelect('company.companyName', 'companyName')
      .addSelect('company.companyImageUrl', 'companyImageUrl')
      // Đếm số lượng người theo dõi mỗi công ty
      // Nhóm theo ID công ty và các trường cần thiết khác
      .groupBy('company.id')
      .addGroupBy('company.slug')
      .addGroupBy('company.companyName')
      .addGroupBy('company.companyImageUrl')
      // Sắp xếp theo số lượng người theo dõi (followerCount)
      .orderBy('COUNT(companyFollowed.id)')
      .limit(10);

    // Lấy kết quả
    const results = await query.getRawMany();
    return results;
  }

  async updateCompanyAvatar(
    file: Express.Multer.File,
    email: string,
  ) {
    const company = await this.findCompanyByEmail(email);
    // Upload file lên Cloudinary và lấy đường dẫn ảnh

    const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(
      file,
      company.slug,
      'companyAvatar',
    );


    if( company.companyImageUrl !== null) {
      await this.cloudinaryService.deleteFile(company.companyImagePublicId);
    }
    // Cập nhật trường `avatarUrl` trong bảng `User`
    await this.companyRepository.update(company.id, {
      companyImageUrl: imageUrl,
      companyImagePublicId: publicId,
    });
    // Trả về thông tin user đã cập nhật
    return await this.getCompanyInfo(email);
  }

  async updateCompanyCover(
    file: Express.Multer.File,
    email: string,
  ) {
    const company = await this.findCompanyByEmail(email);
    // Upload file lên Cloudinary và lấy đường dẫn ảnh
    const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(
      file,
      company.slug,
      'companyCover',
    );
    await this.cloudinaryService.deleteFile(company.companyCoverImagePublicId);
    // Cập nhật trường `avatarUrl` trong bảng `User`
    await this.companyRepository.update(company.id, {
      companyCoverImageUrl: imageUrl,
      companyCoverImagePublicId: publicId,
    });

    // Trả về thông tin user đã cập nhật
    return await this.getCompanyInfo(email);
  }

  async createCompanyImages(
    file: Express.Multer.File,
    email: string,
  ) {
    const company = await this.findCompanyByEmail(email);
    const { publicId, imageUrl } = await this.cloudinaryService.uploadCompanyImage(
      file,
      company.slug,
      'companyImage',
    );
    // Create and save new CompanyImage entry
    const companyImage = new CompanyImage();
    companyImage.imageUrl = imageUrl;
    companyImage.imagePublicId = publicId;
    companyImage.company = company;

    await this.companyImageRepository.save(companyImage);

    return await this.getCompanyImages(email);
  }

  async deleteCompanyImage(imageId: number): Promise<void> {
    // Tìm hình ảnh cần xóa
    const companyImage = await this.companyImageRepository.findOne({
      where: { id: imageId.toString() },
    });
    if (!companyImage) {
      throw new Error(
        'Hình ảnh không tồn tại hoặc không thuộc công ty của bạn.',
      );
    }
    // Xóa file khỏi Cloudinary
    await this.cloudinaryService.deleteFile(companyImage.imagePublicId);

    // Xóa record khỏi database
    await this.companyImageRepository.remove(companyImage);

    console.log(
      `Đã xóa hình ảnh ID ${imageId} khỏi cơ sở dữ liệu và Cloudinary.`,
    );
  }

  async getCompanyImages(email: string): Promise<any> {
    const company = await this.findCompanyByEmail(email);
    // Nếu company có nhiều ảnh, ta có thể map qua mảng companyImage
    const images = company.companyImage.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
    }));

    return {
      count: images.length, // Đếm số lượng ảnh
      results: images, // Trả về mảng các ảnh
    };
  }

  async findCompanyByEmail(email: string): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { user: { email } },
      relations: [
        'user',
        'location',
        'location.city',
        'location.district',
        'companyImage',
      ],
    });

    if (!company) {
      throw new ConflictException('User dont have company');
    }
    return company;
  }

  async updateCompany(companyId: number, updateCompanyDto: UpdateCompanyDto) {
    // Lấy thông tin công ty cần cập nhật
    const company = await this.companyRepository.findOne({
      where: { id: companyId.toString() },
      relations: ['location', 'location.city', 'location.district'], // Đảm bảo load quan hệ location
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Kiểm tra và cập nhật location nếu cần
    if (updateCompanyDto.location) {
      const { city, district, address, lat, lng } = updateCompanyDto.location;
      // Tìm city và district theo ID từ cơ sở dữ liệu
      const cityEntity = await this.cityRepository.findOne({
        where: { id: city },
      });
      const districtEntity = await this.districtRepository.findOne({
        where: { id: district },
      });

      if (!cityEntity || !districtEntity) {
        throw new NotFoundException('City or District not found');
      }

      // Kiểm tra xem address, city, district có giống với location hiện tại không
      const currentLocation = company.location;

      if (
        currentLocation?.address !== address ||
        currentLocation?.city?.id !== city ||
        currentLocation?.district?.id !== district ||
        currentLocation?.lat !== lat ||
        currentLocation?.lng !== lng
      ) {
        // Nếu có sự khác biệt, tạo Location mới
        const newLocation = new Location();
        newLocation.city = cityEntity;
        newLocation.district = districtEntity;
        newLocation.address = address;
        newLocation.lat = lat;
        newLocation.lng = lng;
        // Lưu đối tượng Location mới vào cơ sở dữ liệu
        const savedLocation = await this.locationRepository.save(newLocation);

        // Cập nhật lại location trong công ty
        company.location = savedLocation;
        await this.companyRepository.update(company.id, {
          location: savedLocation,
        });
      }
      // Kiểm tra và cập nhật slug nếu tên công ty thay đổi

      // Cập nhật cc thông tin khác của công ty
      Object.assign(company, updateCompanyDto);
      company.slug = await this.generateUniqueSlug(
        updateCompanyDto.companyName,
        this.companyRepository,
      );
      // Lưu lại công ty đã cập nhật
      const updatedCompany = await this.companyRepository.save(company);
      return updatedCompany;
    }
  }

  // find company by user email
  async findUserByEmail(email: string): Promise<User> {
    const user = this.userRepository.findOne({
      where: { email },
      relations: ['jobSeekerProfile'], // Đảm bảo load quan hệ location
    });
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = this.userRepository.findOne({
      where: { id },
      relations: ['jobSeekerProfile', 'resume'], // Đảm bảo load quan hệ location
    });

    if(!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async generateUniqueSlug(
    companyName: string,
    companyRepository: Repository<Company>,
  ): Promise<string> {
    // Loại bỏ dấu ngoặc và chuyển thành chữ thường
    let slug = companyName
      .replace(/[()]/g, '') // Loại bỏ dấu ngoặc đơn và ngoặc kép
      .toLowerCase(); // Chuyển thành chữ thường
    // Sử dụng slugify để chuyển thành dạng slug chuẩn
    slug = slugify(slug, {
      lower: true, // Chuyển thành chữ thường
      remove: /[^a-z0-9\s-]/g, // Loại bỏ các ký tự không hợp lệ
      replacement: '-', // Thay thế dấu cách bằng dấu gạch ngang
    });

    // Kiểm tra xem slug đã tồn tại trong cơ sở dữ liệu chưa
    let existingCompany = await companyRepository.findOne({ where: { slug } });
    let count = 1;

    // Nếu slug đã tồn tại, thêm số vào cuối slug cho đến khi không còn trùng
    while (existingCompany) {
      slug = `${slug}-${count}`;
      existingCompany = await companyRepository.findOne({ where: { slug } });
      count++;
    }

    return slug;
  }

  async findCompanyBySlug(slug: string) {
    const company = await this.companyRepository.findOne({
      where: { slug },
      relations: [
        'location',
        'location.city',
        'location.district',
        'companyImage',
      ],
    });
    if (!company) {
      throw new NotFoundException('Công ty không tồn tại.');
    }
    return company;
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

  async checkIsFollow(userId: string, companyId: string) {
    let isFollowed = false;
    if (userId) {
      const followRecord = await this.companyFollowedRepository.findOne({
        where: { company: { id: companyId }, user: { id: userId } },
      });
      isFollowed = !!followRecord;
    }
    return isFollowed;
  }

  async getFollowAndJobPostNumber(companyId: string) {
    const followNumber = await this.companyFollowedRepository.count({
      where: { company: { id: companyId } },
    });
    // Đếm số lượng bài đăng việc làm liên kết với công ty
    const jobPostNumber = await this.jobPostRepository.count({
      where: { company: { id: companyId } },
    });
    return { followNumber, jobPostNumber };
  }

  async getPublicCompany(slug: string, headers: any) {
    const company = await this.findCompanyBySlug(slug);
    const userId = await this.getUserByHeader(headers);
    const { followNumber, jobPostNumber } =
      await this.getFollowAndJobPostNumber(company.id);
    const isFollowed = await this.checkIsFollow(userId, company.id);
    // Trả về thông tin công ty
    return CompanyResponseDto.toResponse({
      ...company,
      isFollowed,
      followNumber,
      jobPostNumber,
    });
  }

  async followCompany(slug: string, userId: number): Promise<any> {
    const company = await this.findCompanyBySlug(slug);
    const existingFollow = await this.companyFollowedRepository.findOne({
      where: { user: { id: userId.toString() }, company: { id: company.id } },
    });

    if (existingFollow) {
      await this.companyFollowedRepository.delete(existingFollow.id);
    } else {
      await this.companyFollowedRepository.save({
        user: { id: userId.toString() },
        company: { id: company.id },
      });
    }

    return {
      isFollowed: !existingFollow,
    };
  }

  async getJobSeekerProfile(email: string) {

    // Tìm profile với các relations cần thiết
    const profile = await this.jobSeekerProfileRepository.findOne({
      where: { user: { email } },
      relations: ['user', 'location', 'location.city', 'location.district'],
    });


    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng viên');
    }

    // Tính tuổi từ ngày sinh
    const birthDate = new Date(profile.birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    // Format dữ liệu trả về theo yêu cầu
    return {
      id: profile.id,
      phone: profile.phone,
      birthday: profile.birthday,
      gender: profile.gender,
      maritalStatus: profile.maritalStatus,
      location: {
        city: profile.location?.city?.id,
        districtDict: {
          id: profile.location?.district?.id,
          name: profile.location?.district?.name,
        },
        address: profile.location?.address,
        district: profile.location?.district?.id,
      },
      user: {
        fullName: profile.user?.fullName,
      },
      old: age,
    };
  }

  async updateJobSeekerProfile(email: string, updateProfileDto: any) {
    const profile = await this.jobSeekerProfileRepository.findOne({
      where: { user: { email } },
      relations: ['user', 'location', 'location.city', 'location.district'],
    });

    // Cập nhật thông tin user
    profile.user.fullName = updateProfileDto.user.fullName;
    await this.userRepository.save(profile.user);

    // Xử lý cập nhật location
    if (updateProfileDto.location) {
      const { city, district, address } = updateProfileDto.location;
      const [cityEntity, districtEntity] = await Promise.all([
        this.cityRepository.findOne({ where: { id: city } }),
        this.districtRepository.findOne({ where: { id: district } }),
      ]);

      if (!cityEntity || !districtEntity) {
        throw new NotFoundException('Không tìm thấy thông tin địa chỉ');
      }

      profile.location = await this.locationRepository.save({
        ...profile.location,
        city: cityEntity,
        district: districtEntity,
        address,
      });
    }

    // Cập nhật profile
    Object.assign(profile, {
      phone: updateProfileDto.phone,
      birthday: updateProfileDto.birthday,
      gender: updateProfileDto.gender,
      maritalStatus: updateProfileDto.maritalStatus,
    });

    await this.jobSeekerProfileRepository.save(profile);

    // Tính tuổi
    const age =
      new Date().getFullYear() - new Date(profile.birthday).getFullYear();

    return {
      id: profile.id,
      phone: profile.phone,
      birthday: profile.birthday,
      gender: profile.gender,
      maritalStatus: profile.maritalStatus,
      location: {
        city: profile.location?.city?.id,
        districtDict: {
          id: profile.location?.district?.id,
          name: profile.location?.district?.name,
        },
        address: profile.location?.address,
        district: profile.location?.district?.id,
      },
      user: {
        fullName: profile.user?.fullName,
      },
      old: age,
    };
  }
  async getJobSeekerResumes(jobSeekerId: number, resumeType?: string): Promise<any> {
    const query = this.resumeRepository
      .createQueryBuilder('resume')
      .leftJoinAndSelect('resume.jobSeekerProfile', 'jobSeekerProfile')
      .leftJoinAndSelect('resume.user', 'user') // Tham chiếu user nếu cần
      .where('jobSeekerProfile.id = :jobSeekerId', { jobSeekerId }); // Sử dụng id của JobSeekerProfile
  
    // Nếu có resumeType, thêm điều kiện lọc
    if (resumeType) {
      query.andWhere('resume.type = :resumeType', { resumeType });
    }
  
    const resumes = await query.getMany(); // Lấy danh sách resume
  
    // Nếu không có resume nào, trả về mảng rỗng
    if (!resumes || resumes.length === 0) {
      return [];
    }
  
    // Xử lý logic trả về
    if (resumeType === 'WEBSITE') {
      // Nếu chỉ có 1 loại WEBSITE
      const resume = resumes[0];
      return {
        id: resume.id,
        slug: resume.slug,
        title: resume.title,
        salaryMin: resume.salaryMin,
        salaryMax: resume.salaryMax,
        position: resume.position,
        experience: resume.experience,
        isActive: resume.isActive,
        updateAt: resume.updateAt,
        user: {
          id: resume.user?.id,
          fullName: resume.user?.fullName,
          avatarUrl: resume.user?.avatarUrl,
        },
      };
    } else if (resumeType === 'UPLOAD') {
      // Nếu chỉ có loại UPLOAD
      return resumes.map((resume) => ({
        id: resume.id,
        slug: resume.slug,
        title: resume.title,
        isActive: resume.isActive,
        updateAt: resume.updateAt,
        imageUrl: resume.imageUrl,
        fileUrl: resume.fileUrl,
      }));
    }
  
    // Nếu không có resumeType, trả về tất cả resume với các loại khác nhau
    return resumes.map((resume) => ({
      id: resume.id,
      slug: resume.slug,
      title: resume.title,
      isActive: resume.isActive,
      updateAt: resume.updateAt,
      type: resume.type, // Bao gồm thông tin loại resume
      imageUrl: resume.imageUrl || null,
      fileUrl: resume.fileUrl || null,
      salaryMin: resume.salaryMin || null,
      salaryMax: resume.salaryMax || null,
    }));
  }
  
  


  async getJobSeekerResumesOwner(slug: string) {
    const resume = await this.resumeRepository.findOne({
      where: { slug },
      relations: ['city', 'career'],
    });
    return {
      id: resume.id,
      slug: resume.slug,
      title: resume.title,
      description: resume.description,
      salaryMin: resume.salaryMin,
      salaryMax: resume.salaryMax,
      position: resume.position,
      experience: resume.experience,
      academicLevel: resume.academicLevel,
      typeOfWorkplace: resume.typeOfWorkplace,
      jobType: resume.jobType,
      isActive: resume.isActive,
      career: resume.career?.id,
      city: resume.city?.id,
    };
  }

  async getJobSeekerCV(slug: string) {
    const resume = await this.resumeRepository.findOne({
      where: { slug },
      relations: ['city', 'career'],
    });
    return {
      id: resume.id,
      slug: resume.slug,
      title: resume.title,
      fileUrl: resume.fileUrl,
    };
  }

  async toggleResumeActive(slug: string): Promise<any> {
    // Tìm resume theo slug
    const resumeToToggle = await this.resumeRepository.findOne({
      where: { slug },
      relations: ['jobSeekerProfile'],
    });
  
    if (!resumeToToggle) {
      throw new NotFoundException('Resume not found');
    }
  
    const jobSeekerId = resumeToToggle.jobSeekerProfile.id;
  
    if (resumeToToggle.isActive) {
      // Nếu resume đang active thì tắt active
      resumeToToggle.isActive = false;
      await this.resumeRepository.save(resumeToToggle);
      return { message: 'Resume deactivated successfully' };
    }
  
    // Nếu resume không active, active nó và tắt active các resume khác
    await this.resumeRepository
      .createQueryBuilder()
      .update(Resume)
      .set({ isActive: false })
      .where('jobSeekerProfileId = :jobSeekerId', { jobSeekerId })
      .execute();
  
    resumeToToggle.isActive = true;
    await this.resumeRepository.save(resumeToToggle);
  
    return { message: 'Resume activated successfully', resume: resumeToToggle };
  }
  

  async updatePrivateResume(slug: string, updateResumeDto: any): Promise<any> {
    const resume = await this.getResumeBySlug(slug)  
    Object.assign(resume, updateResumeDto);
    const updatedResume = await this.resumeRepository.save(resume);
  
    return updatedResume;
  }

  async createPrivateResume(
    createResumeDto: CreateResumeDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    const slug = await this.authService.generateResumeSlug(); 
    const [user, city, career] = await Promise.all([
      this.findUserById(userId),
      this.cityRepository.findOne({ where: { id: createResumeDto.city } }),
      this.careerRepository.findOne({ where: { id: createResumeDto.career } }),
    ]);


    let resume = new Resume();
    resume.user = user;
    resume.jobSeekerProfile = user.jobSeekerProfile;
  
    resume.type = 'UPLOAD'
    const { pdfUrl, publicId, imageUrl } = await this.cloudinaryService.uploadPdfWithImage(
      file,
      slug
    )

    Object.assign(resume, {
      ...createResumeDto,
      slug: await this.authService.generateResumeSlug(),
      imageUrl,
      fileUrl: pdfUrl,
      publicId,
      city,
      career,
    });



    try {
      const newResume = await this.resumeRepository.save(resume);
      return newResume;
    } catch (error) {
      console.error('Failed to save resume:', error.message);
      throw new Error('Error saving resume');
    }
  
  }
  async getResumeBySlug(slug: string) {
    const resume = await this.resumeRepository.findOne({
      where: { slug },
      relations: ['city', 'career', 'educationDetail', 'experiencesDetails' , 'languageSkills', 'certificatesDetail', 'advancedSkills'],
    });
    if (!resume) {
      throw new NotFoundException(`Resume not found`);
    }
    return resume;
  }

  async getResumeByUserId(id: string) {
    const resume = await this.resumeRepository.findOne({
      where: { user: { id: id } },
      relations: ['user'],
    });
  
    if (!resume) {
      throw new NotFoundException(`Resume not found for user with id ${id}`);
    }

    return resume
  }

  async getExperiencesDetail(slug: string) {
    const resume = await this.getResumeBySlug(slug);
    return resume.experiencesDetails;
  }

  async getExperiencesDetailById(id: string) {
    const data =  await this.experiencesDetailRepository.findOne({where: { id: id}});
    return data;
  }

  async updateExperiencesDetailById(id: string, updateData: any) {
    const data = await this.experiencesDetailRepository.findOne({ where: { id: id}});
    Object.assign(data, updateData);
    return await this.experiencesDetailRepository.save(data);
  }

  async deleteExperiencesDetailById(id: string):Promise<void> {
    await this.experiencesDetailRepository.delete(id);
  }

  async getEducationDetailById(id: string) {
    const data =  await this.educationDetailRepository.findOne({where: { id: id}});
    return data;
  }

  async updateEducationDetailById(id: string, updateData: any) {
    const data = await this.educationDetailRepository.findOne({ where: { id: id}});
    Object.assign(data, updateData);
    return await this.educationDetailRepository.save(data);
  }

  async deleteEducationDetailById(id: string): Promise<void> {
    await this.educationDetailRepository.delete(id);
  }

  async getEducationsDetail(slug: string) {
    const resume = await this.getResumeBySlug(slug);
    return resume.educationDetail;
  }


  //certificateDetails
  async getCertificatesDetail(slug: string) {
    const resume = await this.getResumeBySlug(slug);
    return resume.certificatesDetail;
  }

  async getCertificatesDetailById(id: string) {
    const data =  await this.certificatesDetailRepository.findOne({where: { id: id}});
    return data;
  }

  async updateCertificatesDetailById(id: string, updateData: any) {
    const data = await this.certificatesDetailRepository.findOne({ where: { id: id}});
    Object.assign(data, updateData);
    return await this.certificatesDetailRepository.save(data);
  }

  async deleteCertificatesDetailById(id: string): Promise<void> {
    await this.certificatesDetailRepository.delete(id);
  }


  //languageSkills
  async getLanguageSkills(slug: string) {
    const resume = await this.getResumeBySlug(slug);
    return resume.languageSkills;
  }

  async getLanguageSkillsById(id: string) {
    const data =  await this.languageSkillsRepository.findOne({where: { id: id}});
    return data;
  }

  async updateLanguageSkillsById(id: string, updateData: any) {
    const data = await this.languageSkillsRepository.findOne({ where: { id: id}});
    Object.assign(data, updateData);
    return await this.languageSkillsRepository.save(data);
  }
  async deleteLanguageSkillsById(id: string): Promise<void> {
    await this.languageSkillsRepository.delete(id);
  }


  async getAdvancedSkills(slug: string) {
    const resume = await this.getResumeBySlug(slug);
    return resume.advancedSkills;
  }

  async getAdvancedSkillsById(id: string) {
    const data =  await this.advancedSkillsRepository.findOne({where: { id: id}});
    return data;
  }

  async updateAdvancedSkillsById(id: string, updateData: any) {
    const data = await this.advancedSkillsRepository.findOne({ where: { id: id}});
    Object.assign(data, updateData);
    return await this.advancedSkillsRepository.save(data);
  }

  async deleteAdvancedSkillsById(id: string): Promise<void> {
    await this.advancedSkillsRepository.delete(id);
  }

  


  async createExperiencesDetail(experiencesDetail: any, id: string) {
    const resume = await this.getResumeByUserId(id)
    const newExperiencesDetail = this.experiencesDetailRepository.create({
      ...experiencesDetail,
      resume: resume // Liên kết với resume
    });
    const savedExperiencesDetail = await this.experiencesDetailRepository.save(newExperiencesDetail);
    return savedExperiencesDetail;
  }

  async createEducationsDetail(educationsDetail: any, id: string) {
    const resume = await this.getResumeByUserId(id)
    const newEducationsDetail = this.educationDetailRepository.create({
      ...educationsDetail,
      resume: resume // Liên kết với resume
    });

    const savedEducationsDetail = await this.educationDetailRepository.save(newEducationsDetail);
    return savedEducationsDetail;
  }

  async createCertificatesDetail(certificatesDetail: any, id: string) {
    const resume = await this.getResumeByUserId(id)
    const newCertificatesDetail = this.certificatesDetailRepository.create({
      ...certificatesDetail,
      resume: resume // Liên kết với resume
    });

    const savedCertificatesDetail = await this.certificatesDetailRepository.save(newCertificatesDetail);
    return savedCertificatesDetail;
  }

  async createLanguageSkills(languageSkills: any, id: string) {
    const resume = await this.getResumeByUserId(id)
    const newLanguageSkills = this.languageSkillsRepository.create({
      ...languageSkills,
      resume: resume // Liên kết với resume
    });

    const savedLanguageSkills = await this.languageSkillsRepository.save(newLanguageSkills);
    return savedLanguageSkills;
  }

  async createAdvancedSkills(advancedSkills: any, id: string) {
    const resume = await this.getResumeByUserId(id)
    const newAdvancedSkills = this.advancedSkillsRepository.create({
      ...advancedSkills,
      resume: resume // Liên kết với resume
    });

    const savedAdvancedSkills = await this.advancedSkillsRepository.save(newAdvancedSkills);
    return savedAdvancedSkills;
  }


  async findAllCompanies(filters: any, headers: any) {
    const { cityId, keyword = '', page = 1, pageSize = 10 } = filters;
    const userId = await this.getUserByHeader(headers);
    // Truy vấn lấy danh sách công ty
    const query = this.companyRepository
      .createQueryBuilder('info_company')
      .leftJoinAndSelect('info_company.location', 'location')
      .leftJoinAndSelect('location.city', 'city')
      .where('info_company.companyName LIKE :kw', { kw: `%${keyword}%` });

    if (cityId) {
      query.andWhere('city.id = :cityId', { cityId });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [companies, count] = await query.getManyAndCount();

    // Chuẩn bị dữ liệu trả về
    const results = await Promise.all(
      companies.map(async (company) => {
        // Lấy số lượng người theo dõi công ty

        const { followNumber, jobPostNumber } =
          await this.getFollowAndJobPostNumber(company.id);
        // Kiểm tra người dùng có theo dõi công ty không
        const isFollowed = await this.checkIsFollow(userId, company.id);
        // Chuyển đổi dữ liệu
        return {
          id: company.id,
          slug: company.slug,
          companyName: company.companyName,
          employeeSize: company.employeeSize,
          fieldOperation: company.fieldOperation,
          companyImageUrl: company.companyImageUrl,
          companyCoverImageUrl: company.companyCoverImageUrl,
          locationDict: {
            city: company.location?.city?.id || null,
          },
          followNumber,
          jobPostNumber,
          isFollowed,
        };
      }),
    );

    return {
      count,
      results,
    };
  }

  async getFollowedCompanies(userId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
  
    // Lấy danh sách công ty mà user đang theo dõi
    const [followedCompanies, totalCount] = await this.companyFollowedRepository.findAndCount({
      where: { user: { id: userId.toString() } },
      relations: ['company'],
      skip,
      take: pageSize,
      order: { createAt: 'DESC' },
    });
    // Xử lý dữ liệu thành định dạng DTO
    const results = await Promise.all(
      followedCompanies.map(async (followed) => {
        const company = followed.company;
  
        // Lấy thông tin bổ sung cho công ty
        const stats = await this.getCompanyStatistics(company.id);
  
        return FollowedCompanyResponseDto.toResponse({
          id: followed.id,
          company: {
            ...company,
            followNumber: stats.followNumber,
            jobPostNumber: stats.jobPostNumber,
            isFollowed: true, // Mặc định là true vì đang ở bảng `CompanyFollowed`
          },
        });
      }),
    );
  
    return {
      count: totalCount,
      results,
    };
  }


  
  async getCompanyStatistics(companyId: string) {
    // Đếm số lượt theo dõi (followNumber)
    const followNumber = await this.companyFollowedRepository.count({
      where: { company: { id: companyId } },
    });
  
    // Đếm số bài đăng tuyển (jobPostNumber)
    const jobPostNumber = await this.jobPostRepository.count({
      where: { company: { id: companyId }, status: 1 }, // Chỉ đếm bài đang hoạt động
    });
  
    return { followNumber, jobPostNumber };
  }


  async getResumeDetails(slug: string, userId: string): Promise<any> {
    try {
      // Truy vấn thông tin Resume cùng với các quan hệ khác
      const resume = await this.resumeRepository.findOne({
        where: { slug },
        relations: [
          'user',
          'user.jobSeekerProfile',
          'city',
          'career',
          'user.jobSeekerProfile.location.district',
          'user.jobSeekerProfile.location.city',
          'advancedSkills',       // Quan hệ với AdvancedSkills
          'languageSkills',       // Quan hệ với LanguageSkills
          'educationDetail',      // Quan hệ với EducationDetail
          'certificatesDetail',   // Quan hệ với CertificatesDetail
        ],
      });
      // Kiểm tra nếu không tìm thấy resume
      if (!resume) {
        throw new NotFoundException('Resume not found');
      }
  
      const jobPost = await this.jobPostRepository.findOne({
        where: { user: { id: userId.toString() } }, // user.id lấy từ resume
      });
      // Kiểm tra xem user có lưu Resume này không qua mối quan hệ với company và resume
      const isSaved = await this.resumeSavedRepository.count({
        where: {
          resume: { id: resume.id },
          company: { id: resume.user?.company?.id },
        },
      });

      const jobPostActivity = await this.jobPostActivityRepository.findOne({
        where: {
          resume: { id: resume.id },
          jobPost: { id: jobPost.id },
        },
      });
      const isSendEmail = jobPostActivity ? jobPostActivity.isSendMail : false;
  
      const lastViewedDate = await this.getLatViewedDate(resume, userId)

      // Trả về dữ liệu đã được map qua DTO
      return ResumeResponseDto.toResponse(resume, isSaved > 0, isSendEmail, lastViewedDate);
    } catch (error) {
      console.error('Error in getResumeDetails:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async getLatViewedDate(resume: any, userId: string, isGetinfo: boolean = false) {
    const company = await this.companyRepository.findOne({where: {user: {id: userId.toString()}}})
    const existingResumeViewed = await this.resumeViewedRepository.findOne({
      where: {
        resume: { id: resume.id },
        company: { id: company.id },
      },
    });
 
    
   
    let lastViewedDate = new Date()
    // Nếu chưa tồn tại ResumeViewed, tạo mới
    if (!existingResumeViewed) {
      const newResumeViewed = this.resumeViewedRepository.create({
        resume: resume,
        company: company,
        views: 1,  // Set views mặc định là 1
      });
      await this.resumeViewedRepository.save(newResumeViewed);
    } else {
      // Nếu đã tồn tại, tăng số lượt views lên 1
      existingResumeViewed.views += 1;
      lastViewedDate = existingResumeViewed.updateAt
      await this.resumeViewedRepository.save(existingResumeViewed);
    }

    if (isGetinfo) {
      return lastViewedDate
    }
    return lastViewedDate
  }

  async checkIsSavedResume(resume: any) {
    const isSaved = await this.resumeSavedRepository.findOne({
      where: {
        resume: { id: resume.id },
        company: { id: resume.user?.company?.id },
      },
    });

    return !!isSaved
  }


  


  async toggleResumeSavedBySlug(slug: string, userId: string): Promise<boolean> {
    // Tìm Resume theo slug
    const resume = await this.resumeRepository.findOne({ where: { slug } });
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }
  
    // Tìm Company theo userId
    const company = await this.companyRepository.findOne({ where: { user: { id: userId } } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
  
    // Kiểm tra xem đã lưu Resume chưa
    const existingRecord = await this.resumeSavedRepository.findOne({
      where: {
        resume: { id: resume.id },
        company: { id: company.id },
      },
    });

    if (existingRecord) {
      // Nếu đã tồn tại, xóa bản ghi
      await this.resumeSavedRepository.remove(existingRecord);
      return false; // Resume không còn được lưu
    } else {
      // Nếu chưa tồn tại, tạo mới
      const newRecord = this.resumeSavedRepository.create({
        resume: { id: resume.id },
        company: { id: company.id },
      });
      await this.resumeSavedRepository.save(newRecord);
      return true; // Resume đã được lưu
    }
  }
  
  async getSavedResumes(
    userId: string,
    cityId?: number,
    experienceId?: number,
    keyword?: string,
    page: number = 1,
    pageSize: number = 10,
    salaryMax?: number
  ): Promise<{ count: number; results: any[] }> {


    const company = await this.companyRepository.findOne({where: {user: {id: userId}}})
    const companyId = company.id
    const query = this.resumeSavedRepository
      .createQueryBuilder('resumeSaved')
      .leftJoinAndSelect('resumeSaved.resume', 'resume')
      .leftJoinAndSelect('resume.user', 'user')
      .leftJoinAndSelect('resume.city', 'city')
      .leftJoinAndSelect('resume.jobSeekerProfile', 'jobSeekerProfile')
      .where('resumeSaved.company = :companyId', { companyId });
  
    // Bộ lọc theo cityId
    if (cityId) {
      query.andWhere('resume.city = :cityId', { cityId });
    }
  
    // Bộ lọc theo experienceId
    if (experienceId) {
      query.andWhere('resume.experience = :experienceId', { experienceId });
    }
  
    // Bộ lọc theo keyword (kw)
    if (keyword) {
      query.andWhere('(resume.title LIKE :keyword OR user.fullName LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
  
    // Bộ lọc theo salaryMax
    if (salaryMax) {
      query.andWhere('resume.salaryMax <= :salaryMax', { salaryMax });
    }
  
    // Phân trang
    const [results, count] = await query
      .orderBy('resumeSaved.createAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    // console.log(results);
    // Map kết quả về đúng format yêu cầu
    const mappedResults = results.map((item) => ({
      id: item.id,
      resume: {
        id: item.resume.id,
        slug: item.resume.slug,
        title: item.resume.title,
        salaryMin: item.resume.salaryMin,
        salaryMax: item.resume.salaryMax,
        experience: item.resume.experience,
        city: item.resume.city?.id || null,
        userDict: {
          id: item.resume.user.id,
          fullName: item.resume.user.fullName,
        },
        jobSeekerProfileDict: {
          id: item.resume.jobSeekerProfile?.id || null,
          // old: item.resume.jobSeekerProfile?.age || null,
        },
        type: item.resume.type,
      },
      createAt: item.createAt,
    }));
  
    return {
      count,
      results: mappedResults,
    };
  }
  
  async exportSavedResumes(
    userId: string,
    cityId?: number,
    experienceId?: number,
    keyword?: string,
    page: number = 1,
    pageSize: number = 10,
    salaryMax?: number
  ): Promise<any[]> {

    const company = await this.companyRepository.findOne({where: {user: {id: userId}}})
    const companyId = company.id

    const query = this.resumeSavedRepository
      .createQueryBuilder('resumeSaved')
      .leftJoinAndSelect('resumeSaved.resume', 'resume')
      .leftJoinAndSelect('resume.user', 'user')
      .leftJoinAndSelect('resume.city', 'city')
      .leftJoinAndSelect('resume.jobSeekerProfile', 'jobSeekerProfile')
      .where('resumeSaved.company = :companyId', { companyId });
  
    // Bộ lọc theo cityId
    if (cityId) {
      query.andWhere('resume.city = :cityId', { cityId });
    }
  
    // Bộ lọc theo experienceId
    if (experienceId) {
      query.andWhere('resume.experience = :experienceId', { experienceId });
    }
  
    // Bộ lọc theo keyword (kw)
    if (keyword) {
      query.andWhere('(resume.title LIKE :keyword OR jobSeekerProfile.fullName LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
  
    // Bộ lọc theo salaryMax
    if (salaryMax) {
      query.andWhere('resume.salaryMax <= :salaryMax', { salaryMax });
    }
  
    // Phân trang
    const [results] = await query
      .orderBy('resumeSaved.createAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
  
    // Map kết quả về đúng định dạng yêu cầu
    return results.map((item, index) => ({
      STT: index + 1,
      'Tên hồ sơ': item.resume.title,
      'Họ và tên': item.resume.user.fullName,
      Email: item.resume.user.email,
      'Số điện thoại': item.resume.jobSeekerProfile.phone || null,
      'Giới tính': item.resume.jobSeekerProfile.gender || null,
      'Ngày sinh': moment(item.resume.jobSeekerProfile.birthday).format('DD/MM/YYYY') || null,
      'Địa chỉ': item.resume.city?.name || null,
      'Ngày lưu': moment(item.createAt).format('DD/MM/YYYY')
    }));
  }
  

  
  async getResumes(query: GetResumesQuery, userId: string): Promise<any> {
    const {
      academicLevelId,
      careerId,
      cityId,
      experienceId,
      genderId,
      jobTypeId,
      kw,
      maritalStatusId,
      page,
      pageSize,
      positionId,
      typeOfWorkplaceId,
    } = query;
  
    const qb = this.resumeRepository.createQueryBuilder('resume')
      .leftJoinAndSelect('resume.user', 'user')
      .leftJoinAndSelect('resume.jobSeekerProfile', 'jobSeekerProfile')
      .leftJoinAndSelect('resume.city', 'city')
      .leftJoinAndSelect('resume.resumeViewed', 'resumeViewed')
      .loadRelationCountAndMap('resume.viewEmployerNumber', 'resume.resumeViewed')
      .where('resume.isActive = :isActive', { isActive: true });
  
    // Thêm điều kiện lọc
    if (academicLevelId) qb.andWhere('jobSeekerProfile.academicLevelId = :academicLevelId', { academicLevelId });
    if (careerId) qb.andWhere('resume.careerId = :careerId', { careerId });
    if (cityId) qb.andWhere('resume.cityId = :cityId', { cityId });
    if (experienceId) qb.andWhere('jobSeekerProfile.experienceId = :experienceId', { experienceId });
    if (genderId) qb.andWhere('jobSeekerProfile.gender = :genderId', { genderId });
    if (jobTypeId) qb.andWhere('resume.jobTypeId = :jobTypeId', { jobTypeId });
    if (kw) qb.andWhere('(resume.title LIKE :kw OR user.fullName LIKE :kw)', { kw: `%${kw}%` });
    if (maritalStatusId) qb.andWhere('jobSeekerProfile.maritalStatusId = :maritalStatusId', { maritalStatusId });
    if (positionId) qb.andWhere('resume.positionId = :positionId', { positionId });
    if (typeOfWorkplaceId) qb.andWhere('resume.typeOfWorkplaceId = :typeOfWorkplaceId', { typeOfWorkplaceId });
  
    // Phân trang
    qb.skip((page - 1) * pageSize).take(pageSize);
  
    // Lấy dữ liệu
    const [results, count] = await qb.getManyAndCount();
    
    // Map dữ liệu trả về
    return {
      count,
      results: await Promise.all(results.map(async (resume) => {

        return {
          id: resume.id,
          slug: resume.slug,
          title: resume.title,
          salaryMin: resume.salaryMin,
          salaryMax: resume.salaryMax,
          experience: resume.experience,
          updateAt: moment(resume.updateAt).toISOString(),
          city: resume.city?.id || null,
          isSaved: await this.checkIsSavedResume(resume), // Nếu có nhà tuyển dụng lưu hồ sơ thì isSaved = true
          viewEmployerNumber: await this.getViewResumeNumber(resume), // Trả về số lượng nhà tuyển dụng lưu hồ sơ
          lastViewedDate: await this.getLatViewedDate(resume, userId, true) || null,
          userDict: {
            id: resume.user?.id,
            fullName: resume.user?.fullName,
          },
          jobSeekerProfileDict: {
            id: resume.jobSeekerProfile?.id,
            old: resume.jobSeekerProfile?.birthday
              ? moment().diff(moment(resume.jobSeekerProfile.birthday), 'years')
              : null, // Tính tuổi từ ngày sinh
          },
          type: resume.type,
        };
      })),
    };
    
  }

  async getResumesAdmin(query: GetResumesQuery): Promise<any> {
    const {
      academicLevelId,
      careerId,
      cityId,
      experienceId,
      genderId,
      jobTypeId,
      kw,
      maritalStatusId,
      page,
      pageSize,
      positionId,
      typeOfWorkplaceId,
    } = query;
  
    const qb = this.resumeRepository.createQueryBuilder('resume')
      .leftJoinAndSelect('resume.user', 'user')
      .leftJoinAndSelect('resume.jobSeekerProfile', 'jobSeekerProfile')
      .leftJoinAndSelect('resume.city', 'city')
      .leftJoinAndSelect('resume.resumeViewed', 'resumeViewed')
      .loadRelationCountAndMap('resume.viewEmployerNumber', 'resume.resumeViewed')
      // .where('resume.isActive = :isActive', { isActive: true });
  
    // Thêm điều kiện lọc
    if (academicLevelId) qb.andWhere('jobSeekerProfile.academicLevelId = :academicLevelId', { academicLevelId });
    if (careerId) qb.andWhere('resume.careerId = :careerId', { careerId });
    if (cityId) qb.andWhere('resume.cityId = :cityId', { cityId });
    if (experienceId) qb.andWhere('jobSeekerProfile.experienceId = :experienceId', { experienceId });
    if (genderId) qb.andWhere('jobSeekerProfile.gender = :genderId', { genderId });
    if (jobTypeId) qb.andWhere('resume.jobTypeId = :jobTypeId', { jobTypeId });
    if (kw) qb.andWhere('(resume.title LIKE :kw OR user.fullName LIKE :kw)', { kw: `%${kw}%` });
    if (maritalStatusId) qb.andWhere('jobSeekerProfile.maritalStatusId = :maritalStatusId', { maritalStatusId });
    if (positionId) qb.andWhere('resume.positionId = :positionId', { positionId });
    if (typeOfWorkplaceId) qb.andWhere('resume.typeOfWorkplaceId = :typeOfWorkplaceId', { typeOfWorkplaceId });
  
    // Phân trang
    qb.skip((page - 1) * pageSize).take(pageSize);
  
    // Lấy dữ liệu
    const [results, count] = await qb.getManyAndCount();
    
    // Map dữ liệu trả về
    return {
      count,
      results: await Promise.all(results.map(async (resume) => {

        return {
          id: resume.id,
          slug: resume.slug,
          title: resume.title,
          salaryMin: resume.salaryMin,
          salaryMax: resume.salaryMax,
          experience: resume.experience,
          updateAt: moment(resume.updateAt).toISOString(),
          city: resume.city?.id || null,
          isSaved: await this.checkIsSavedResume(resume), // Nếu có nhà tuyển dụng lưu hồ sơ thì isSaved = true
          viewEmployerNumber: await this.getViewResumeNumber(resume), // Trả về số lượng nhà tuyển dụng lưu hồ sơ
          // lastViewedDate: await this.getLatViewedDate(resume, userId, true) || null,
          userDict: {
            id: resume.user?.id,
            fullName: resume.user?.fullName,
          },
          jobSeekerProfileDict: {
            id: resume.jobSeekerProfile?.id,
            old: resume.jobSeekerProfile?.birthday
              ? moment().diff(moment(resume.jobSeekerProfile.birthday), 'years')
              : null, // Tính tuổi từ ngày sinh
          },
          type: resume.type,
        };
      })),
    };
    
  }

  async getViewResumeNumber(resume:any) {
    const viewEmployerNumber = await this.resumeSavedRepository.count({
      where: {
        resume: { id: resume.id },
        company: { id: resume.user?.company?.id },
      },
    });
    return viewEmployerNumber
  }

  async getResumeViews(page: number, pageSize: number, userId: number): Promise<any> {
    const [resumeViews, count] = await this.resumeViewedRepository.findAndCount({
      where: {
        resume: { user: { id: userId.toString() } },
      },
      relations: ['resume', 'company'],
      order: { createAt: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    

    const results = await Promise.all(
      resumeViews.map(async (viewed) => {
        const isSavedResume = await this.resumeSavedRepository.count({
          where: {
            resume: { id: viewed.resume.id },
            company: { id: viewed.company.id },
          },
        });
  
        return {
          id: viewed.id,
          views: viewed.views,
          createAt: moment(viewed.createAt).toISOString(),
          resume: {
            id: viewed.resume.id,
            title: viewed.resume.title,
          },
          company: {
            id: viewed.company.id,
            slug: viewed.company.slug,
            companyName: viewed.company.companyName,
            companyImageUrl: viewed.company.companyImageUrl || null,
          },
          isSavedResume: isSavedResume > 0,
        };
      })
    );
  
    return {
      errors: {},
      data: {
        count,
        results,
      },
    };
  }


  async getAllCompany() {
    return await this.companyRepository.find();
  }
  
}

  
  





interface GetResumesQuery {
  academicLevelId?: string;
  careerId?: string;
  cityId?: string;
  experienceId?: string;
  genderId?: string;
  jobTypeId?: string;
  kw?: string;
  maritalStatusId?: string;
  page: number;
  pageSize: number;
  positionId?: string;
  typeOfWorkplaceId?: string;
}