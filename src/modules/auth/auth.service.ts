import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';
import { ErrorEnum } from 'src/constants/error-code.constant';
import { JobSeekerProfile } from '../info/entities/job_seeker_profle.entities';
import { JwtService } from '@nestjs/jwt';
import { AuthCredDto, AuthGetTokenDto } from './dto/auth.dto';
import { Location } from '../common/entities/location.entity';
import { EmployerRegisterDto } from './dto/employer-auth.dto';
import { Company } from '../info/entities/company.entity';
import { UserResponseDto } from '../user/dto/user.dto';
import { UpDateUserDto } from './dto/user.dto';
import { CloudinaryService } from './../cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  CloudinaryService: any;
  static findUserByEmail(email: string) {
    throw new Error('Method not implemented.');
  }

    constructor(
        private cloudinaryService: CloudinaryService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        @InjectRepository(JobSeekerProfile)
        private jobSeekerProfileRepository: Repository<JobSeekerProfile>,
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        
      ) {}

      //Job Seeker
      async job_seeker_register_services(jobSeekerRegisterDto: JobSeekerRegisterDto) {
        await this.checkUserExist(jobSeekerRegisterDto.email)
        //hash password
        jobSeekerRegisterDto.password = await this.hashPassword(jobSeekerRegisterDto.password);
        //tạo mới user trong csdl
        const newJobSeeker = this.userRepository.create({  ...jobSeekerRegisterDto });
        const savedUser = await this.userRepository.save(newJobSeeker);
         // Tạo bản ghi job_seeker_profile liên kết với user vừa tạo
        const newJobSeekerProfile = this.jobSeekerProfileRepository.create({
          user: savedUser,
        });
        await this.jobSeekerProfileRepository.save(newJobSeekerProfile);
        return savedUser;
      }

      async employer_register_services(employerRegisterDto: EmployerRegisterDto) {
        await this.checkUserExist(employerRegisterDto.email);
        console.log(employerRegisterDto.company);

        const newUser = this.userRepository.create({
          email: employerRegisterDto.email,
          fullName: employerRegisterDto.fullName,
          password: await this.hashPassword(employerRegisterDto.password),
          roleName: "EMPLOYER",
          hasCompany: true,
        });
        const savedUser = await this.userRepository.save(newUser);


        const newLocation = this.locationRepository.create({
          city: { id: employerRegisterDto.company.location.city }, // Gán đối tượng { id: cityID }
          district: { id: employerRegisterDto.company.location.district }, // Gán đối tượng { id: districtID }
          address: employerRegisterDto.company.location.address,
        });

        const savedLocation = await this.locationRepository.save(newLocation);
        employerRegisterDto.company.slug = await this.generateSlug(employerRegisterDto.company.companyName) || "no-name"
    // Tạo mới company
        const newCompany = this.companyRepository.create({
          ...employerRegisterDto.company,
          location: savedLocation,
          user: savedUser,
      });
        return this.companyRepository.save(newCompany);
      }    


      //all
      async get_user_info(email: string):Promise<any> {
        const user = await this.userRepository.findOne({
          where: { email },
          relations: ['jobSeekerProfile', 'company'], // Liên kết với bảng JobSeekerProfile
        });
        return UserResponseDto.toResponse(user);
      }

      async updateUser( upDateUserDto: UpDateUserDto,email: string, id: number) {
        await this.userRepository.update(id, { fullName: upDateUserDto.fullName });
        return await this.get_user_info(email)
      }

      async updateAvatar(file: Express.Multer.File, userId: number, email:string) {
        // Upload file lên Cloudinary và lấy đường dẫn ảnh
        const user = await this.findUserByEmail(email)
        // await this.cloudinaryService.deleteFile(company.companyImagePublicId)
        const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(file, +user.id, 'avatar');
        
        // Cập nhật trường `avatarUrl` trong bảng `User`
        await this.userRepository.update(+user.id, { avatarUrl: imageUrl, avatarPublicId: publicId });
    
        // Trả về thông tin user đã cập nhật
        return await this.get_user_info(email)
      }
    

      async check_creds_services(authCredDto:AuthCredDto):Promise<any> {
        const user = await this.findUserByEmail(authCredDto.email);
        if (!user ) {
          return {
            email: authCredDto.email,
            email_verified:false,
            exists:false
          }
        }

        if (!user.isVerifyEmail) {
          return {
            email: authCredDto.email,
            email_verified:false,
            exists:true
          }
        }
        
        return {
          email: authCredDto.email,
          email_verified:true,
          exists:true
        }
    }

    async get_token_services(authGetTokenDto:AuthGetTokenDto):Promise<any> {
  
      const user = await this.validate_user(authGetTokenDto)
      
      if (user) {
        return {
          errors: {},
          scope: "read write",
          token_type :"Bearer",
          backend: "backend",
          refresh_token: this.jwtService.sign({ ...user }, { expiresIn: '7d' }),
          access_token:  this.jwtService.sign({ ...user}), // Tạo JWT token
        };
      }
     
    }


    async revokeToken(token: string): Promise<void> {
      // Giải mã token để lấy thông tin
      try {
        const decodedToken = this.jwtService.decode(token);
        console.log(token);
        // Kiểm tra token hợp lệ không
        if (!decodedToken) {
          throw new Error('Token không hợp lệ');
        }
        // Lưu token vào bảng revoked_tokens
        // const revokedToken = this.revokedTokenRepository.create({ token });
        // await this.revokedTokenRepository.save(revokedToken);
        console.log('Token đã bị thu hồi');
      } catch (error) {
        console.error('Lỗi khi thu hồi token:', error);
        throw new Error('Thu hồi token thất bại');
      }
    }
    



    async get_user_info_services() {
    }

    // service function
    async findUserByEmail(email:string):Promise<User> {
      const user =  this.userRepository.findOne({ where: { email } });
      return user
    }

    async checkUserExist(email:string):Promise<void> {
      const user = await this.findUserByEmail(email);
      if (user) {
        throw new ConflictException(ErrorEnum.SYSTEM_USER_EXISTS);
     }
    }

    async validate_user(authGetTokenDto:AuthGetTokenDto): Promise<any> {
      const user = await this.findUserByEmail(authGetTokenDto.username);

      if (user && await bcrypt.compare(authGetTokenDto.password, user.password)) {
        const { id, roleName, email } = user;
        await this.userRepository.update(user.id, { lastLogin: new Date() });
        return { id, roleName, email };
      }
  
      throw new NotFoundException(`User not found!`)
    }

    async hashPassword(password: string): Promise<string> {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword
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
      let isSlugExist = await this.companyRepository.findOne({ where: { slug } });
    
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
        isSlugExist = await this.companyRepository.findOne({ where: { slug } });
      }
    
      return slug;
    }

  }