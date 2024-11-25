import {
  ConflictException,
  Injectable,
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

@Injectable()
export class InfoService {
  constructor(
    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
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
    userId: number,
    email: string,
  ) {
    const company = await this.findCompanyByEmail(email);
    // Upload file lên Cloudinary và lấy đường dẫn ảnh
    await this.cloudinaryService.deleteFile(company.companyImagePublicId);
    const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(
      file,
      company.id,
      'companyAvatar',
    );
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
    userId: number,
    email: string,
  ) {
    const company = await this.findCompanyByEmail(email);
    // Upload file lên Cloudinary và lấy đường dẫn ảnh
    const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(
      file,
      company.id,
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
    userId: number,
    email: string,
  ) {
    const company = await this.findCompanyByEmail(email);
    const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(
      file,
      company.id,
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

  async getJobSeekerResumes(jobSeekerId: number, resumeType: string) {
    const resumes = await this.resumeRepository
      .createQueryBuilder('resume')
      .where('resume.jobSeekerId = :jobSeekerId', { jobSeekerId })
      .andWhere('resume.type = :resumeType', { resumeType })
      .leftJoinAndSelect('resume.jobSeeker', 'jobSeeker')
      // Add other necessary joins here
      .getMany();
  
    return resumes;
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
}
