import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../common/entities/location.entity';
import { ErrorEnum } from 'src/constants/error-code.constant';
import moment from 'moment';
import { CompanyDto, CompanyResponseDto, UpdateCompanyDto } from './dto/company.dto';
import { City } from '../common/entities/city.entity';
import { District } from '../common/entities/district.entity';
import slugify from 'slugify';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CompanyImage } from './entities/company-image.entity';

@Injectable()
export class InfoService {
  constructor(
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
) {}

  async getCompanyInfo(email: string) {
    const company = await this.findCompanyByEmail(email);
    return {
      errors: {},
      data:  CompanyResponseDto.toResponse(company)
    }

  }

  async updateCompanyAvatar(file: Express.Multer.File, userId: number, email:string) {
    const company = await this.findCompanyByEmail(email); 
    // Upload file lên Cloudinary và lấy đường dẫn ảnh
    const companyImageUrl = await this.cloudinaryService.uploadFile(file, company.id, 'companyAvatar');
    // Cập nhật trường `avatarUrl` trong bảng `User`
    await this.companyRepository.update(company.id, { companyImageUrl });

    // Trả về thông tin user đã cập nhật
    return await this.getCompanyInfo(email)
  }

  async updateCompanyCover(file: Express.Multer.File, userId: number, email:string) {
    const company = await this.findCompanyByEmail(email); 
    // Upload file lên Cloudinary và lấy đường dẫn ảnh
    const companyCoverImageUrl = await this.cloudinaryService.uploadFile(file, company.id, 'companyCover');
    // Cập nhật trường `avatarUrl` trong bảng `User`
    await this.companyRepository.update(company.id, { companyCoverImageUrl });

    // Trả về thông tin user đã cập nhật
    return await this.getCompanyInfo(email)
  }


  async createCompanyImages(file: Express.Multer.File, userId: number, email: string) {
    const company = await this.findCompanyByEmail(email);
    const imageUrl = await this.cloudinaryService.uploadFile(file, company.id, 'companyImage');

    // Create and save new CompanyImage entry
    const companyImage = new CompanyImage();
    companyImage.imageUrl = imageUrl;
    companyImage.company = company;
    
    await this.companyImageRepository.save(companyImage);

    return await this.getCompanyInfo(email);
}

async getCompanyImages(email: string): Promise<any> {
  const company = await this.findCompanyByEmail(email);

  if (!company) {
    throw new Error('Company not found');
  }

  // Nếu company có nhiều ảnh, ta có thể map qua mảng companyImage
  const images = company.companyImage.map(image => ({
    id: image.id,
    imageUrl: image.imageUrl
  }));
  
  return {
    count: images.length,  // Đếm số lượng ảnh
    results: images,       // Trả về mảng các ảnh
  };
}
  async findCompanyByEmail(email: string): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { user: { email } },
      relations: ['user', 'location', 'location.city', 'location.district', 'companyImage'],
    });

    if (!company) {
      throw new ConflictException('User dont have company');
    }
    return company
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
      const cityEntity = await this.cityRepository.findOne({ where: { id: city } });
      const districtEntity = await this.districtRepository.findOne({ where: { id: district } });
  
      if (!cityEntity || !districtEntity) {
        throw new NotFoundException('City or District not found');
      }
  
      // Kiểm tra xem address, city, district có giống với location hiện tại không
      const currentLocation = company.location;
      console.log(company.location);
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
        await this.companyRepository.update(company.id, { location: savedLocation });
      }
  // Kiểm tra và cập nhật slug nếu tên công ty thay đổi
  
    // Cập nhật các thông tin khác của công ty
    Object.assign(company, updateCompanyDto);
    company.slug = await this.generateUniqueSlug(updateCompanyDto.companyName, this.companyRepository);
    // Lưu lại công ty đã cập nhật
    const updatedCompany = await this.companyRepository.save(company);
    return updatedCompany;
  }
  
  }

  // find company by user email
  async findUserByEmail(email:string):Promise<User> {
    const user =  this.userRepository.findOne({ where: { email } });
    return user
  }



  async generateUniqueSlug(companyName: string, companyRepository: Repository<Company>): Promise<string> {
    // Loại bỏ dấu ngoặc và chuyển thành chữ thường
    let slug = companyName
      .replace(/[()]/g, '')  // Loại bỏ dấu ngoặc đơn và ngoặc kép
      .toLowerCase();        // Chuyển thành chữ thường
    // Sử dụng slugify để chuyển thành dạng slug chuẩn
    slug = slugify(slug, {
      lower: true,              // Chuyển thành chữ thường
      remove: /[^a-z0-9\s-]/g,  // Loại bỏ các ký tự không hợp lệ
      replacement: '-',         // Thay thế dấu cách bằng dấu gạch ngang
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
}