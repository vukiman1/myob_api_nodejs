import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { Resume } from '../info/entities/resume.entity';
import { NodemailerService } from '../nodemailer/nodemailer.service';

@Injectable()
export class AuthService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private nodemailerService: NodemailerService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(JobSeekerProfile)
    private jobSeekerProfileRepository: Repository<JobSeekerProfile>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  //Job Seeker
  async job_seeker_register_services(
    jobSeekerRegisterDto: JobSeekerRegisterDto,
  ) {
    if (
      jobSeekerRegisterDto.password !== jobSeekerRegisterDto.confirmPassword
    ) {
      throw new BadRequestException('Password and confirm password not match');
    }
    await this.checkUserExist(jobSeekerRegisterDto.email);
    //hash password
    jobSeekerRegisterDto.password = await this.hashPassword(
      jobSeekerRegisterDto.password,
    );
    //tạo mới user trong csdl
    const newJobSeeker = this.userRepository.create({
      ...jobSeekerRegisterDto,
    });
    const savedUser = await this.userRepository.save(newJobSeeker);
    // Tạo slug cho resume
    const resumeSlug = await this.generateResumeSlug();

    const newJobSeekerProfile = this.jobSeekerProfileRepository.create({
      user: savedUser,
    });

    const savedProfile =
      await this.jobSeekerProfileRepository.save(newJobSeekerProfile);

    // Tạo bản ghi resume với slug
    const newResume = this.resumeRepository.create({
      user: savedUser,
      slug: resumeSlug,
      jobSeekerProfile: savedProfile,
    });
    await this.resumeRepository.save(newResume);

    // Tạo JWT token xác thực email
    const payload = { email: savedUser.email };
    const verificationToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET, // Secret key từ .env
      expiresIn: '360d', // Thời gian token hết hạn
    });

    await this.nodemailerService.sendEmailVerification(savedUser.fullName, savedUser.email, verificationToken, 'JOBSEEKER')

    return savedUser;
  }

  async employer_register_services(employerRegisterDto: EmployerRegisterDto) {
    await this.checkUserExist(employerRegisterDto.email);

    const newUser = this.userRepository.create({
      email: employerRegisterDto.email,
      fullName: employerRegisterDto.fullName,
      password: await this.hashPassword(employerRegisterDto.password),
      roleName: 'EMPLOYER',
      hasCompany: true,
    });
    const savedUser = await this.userRepository.save(newUser);

    const newLocation = this.locationRepository.create({
      city: { id: employerRegisterDto.company.location.city }, // Gán đối tượng { id: cityID }
      district: { id: employerRegisterDto.company.location.district }, // Gán đối tượng { id: districtID }
      address: employerRegisterDto.company.location.address,
    });

    const savedLocation = await this.locationRepository.save(newLocation);
    employerRegisterDto.company.slug =
      (await this.generateSlug(employerRegisterDto.company.companyName)) ||
      'no-name';
    // Tạo mới company
    const newCompany = this.companyRepository.create({
      ...employerRegisterDto.company,
      location: savedLocation,
      user: savedUser,
    });
     // Tạo JWT token xác thực email
     const payload = { email: savedUser.email };
     const verificationToken = this.jwtService.sign(payload, {
       secret: process.env.JWT_SECRET, // Secret key từ .env
       expiresIn: '360d', // Thời gian token hết hạn
     });
 
     await this.nodemailerService.sendEmailVerification(savedUser.fullName, savedUser.email, verificationToken, 'EMPLOYEE')
 

    return this.companyRepository.save(newCompany);
  }

  //all
  async get_user_info(email: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['jobSeekerProfile', 'company'], // Liên kết với bảng JobSeekerProfile
    });
    return UserResponseDto.toResponse(user);
  }

  async updateUser(upDateUserDto: UpDateUserDto, email: string, id: number) {
    await this.userRepository.update(id, { fullName: upDateUserDto.fullName });
    return await this.get_user_info(email);
  }

  async updateAvatar(file: Express.Multer.File, email: string) {
    // Upload file lên Cloudinary và lấy đường dẫn ảnh
    const user = await this.findUserByEmail(email);
    // await this.cloudinaryService.deleteFile(company.companyImagePublicId)
    const { publicId, imageUrl } = await this.cloudinaryService.uploadFile(
      file,
      user.id,
      'avatar',
    );
    

    if (user.avatarPublicId !== null) {
      await this.cloudinaryService.deleteFile(user.avatarPublicId);
    }

    // Cập nhật trường `avatarUrl` trong bảng `User`
    await this.userRepository.update(+user.id, {
      avatarUrl: imageUrl,
      avatarPublicId: publicId,
    });

    // Trả về thông tin user đã cập nhật
    return await this.get_user_info(email);
  }

  async check_creds_services(authCredDto: AuthCredDto): Promise<any> {
    const user = await this.findUserByEmail(authCredDto.email);
    if (!user) {
      return {
        email: authCredDto.email,
        email_verified: false,
        exists: false,
      };
    }

    if (user.isVerifyEmail === false) {
      return {
        email: authCredDto.email,
        email_verified: false,
        exists: true,
      };
    }

    return {
      email: authCredDto.email,
      email_verified: true,
      exists: true,
    };
  }

  async get_token_services(authGetTokenDto: AuthGetTokenDto): Promise<any> {
    const user = await this.validate_user(authGetTokenDto);

    if (user) {
      return {
        errors: {},
        scope: 'read write',
        token_type: 'Bearer',
        backend: 'backend',
        refresh_token: this.jwtService.sign({ ...user }, { expiresIn: '7d' }),
        access_token: this.jwtService.sign({ ...user }), // Tạo JWT token
      };
    }
  }

  async revokeToken(token: string): Promise<void> {
    // Giải mã token để lấy thông tin
    try {
      const decodedToken = this.jwtService.decode(token);

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

  async get_user_info_services() {}

  // service function
  async findUserByEmail(email: string): Promise<User> {
    const user = this.userRepository.findOne({ where: { email } });
    return user;
  }

  async checkUserExist(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (user) {
      throw new ConflictException(ErrorEnum.SYSTEM_USER_EXISTS);
    }
  }

  async verifyUserEmail(token: string) {
    const payload = await this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    const user = await this.findUserByEmail(payload.email);   
    user.isVerifyEmail = true;
    await this.userRepository.save(user);
  }

  async forgotPassword(forgotPasswordDto: any) {
    const payload = { email: forgotPasswordDto.email};
    const Token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET, // Secret key từ .env
      expiresIn: '1h', // Thời gian token hết hạn
    });
    await this.nodemailerService.sendEmailforgotPassword(forgotPasswordDto.email, Token)

  }

  async resetPassword(resetPasswordto: any) {
    const payload = await this.jwtService.verify(resetPasswordto.token, { secret: process.env.JWT_SECRET });
    const user = await this.findUserByEmail(payload.email);  
    if (resetPasswordto.newPassword === resetPasswordto.confirmPassword) {
      user.password = await this.hashPassword(resetPasswordto.newPassword);
      await this.userRepository.save(user);
      return 'Password has been updated successfully!';
    }
    throw new BadRequestException()
  }

  async validate_user(authGetTokenDto: AuthGetTokenDto): Promise<any> {
    const user = await this.findUserByEmail(authGetTokenDto.username);
    if (
      user &&
      (await bcrypt.compare(authGetTokenDto.password, user.password))
    ) {
      const { id, roleName, email } = user;
      await this.userRepository.update(user.id, { lastLogin: new Date() });
      return { id, roleName, email };
    }

    throw new BadRequestException({
      errorMessage: ['Mật khẩu không chính xác!']
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
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

  async generateResumeSlug(): Promise<string> {
    const baseSlug = 'resume';

    // Tìm tất cả các resume có slug bắt đầu bằng 'resume'
    const existingSlugs = await this.resumeRepository
      .createQueryBuilder('resume')
      .where('resume.slug LIKE :pattern', { pattern: `${baseSlug}%` })
      .orderBy('resume.slug', 'DESC')
      .getMany();

    if (existingSlugs.length === 0) {
      return baseSlug;
    }

    // Tìm số lớn nhất hiện tại
    let maxNumber = 0;
    existingSlugs.forEach((resume) => {
      const match = resume.slug.match(/^resume-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // Tạo slug mới với số tiếp theo
    return `${baseSlug}-${maxNumber + 1}`;
  }

  async convertGoogleToken(googleToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleToken}` }
      });
      
      if (!response.ok) {
        throw new BadRequestException('Invalid Google token');
      }
      const googleUser = await response.json();
      let user = await this.userRepository.findOne({ where: { email: googleUser.email } });
      
      if (!user) {
        user = this.userRepository.create({
          email: googleUser.email,
          fullName: googleUser.name,
          roleName: 'JOB_SEEKER',
          avatarUrl: googleUser.picture,
          isVerifyEmail: true,
          isActive: true,
          lastLogin: new Date(),
          password: await this.hashPassword(Math.random().toString(36).slice(-8))
        });
        user = await this.userRepository.save(user);
  
        // Generate resume slug
        const resumeSlug = await this.generateResumeSlug();
  
        // Create JobSeekerProfile
        const newJobSeekerProfile = this.jobSeekerProfileRepository.create({
          user: user
        });
        const savedProfile = await this.jobSeekerProfileRepository.save(newJobSeekerProfile);
  
        // Create Resume with slug
        const newResume = this.resumeRepository.create({
          user: user,
          slug: resumeSlug,
          jobSeekerProfile: savedProfile,
        });
        await this.resumeRepository.save(newResume);
  
        // Send verification email
        const payload = { email: user.email };
        const verificationToken = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '360d',
        });
        await this.nodemailerService.sendEmailVerification(
          user.fullName, 
          user.email, 
          verificationToken, 
          'JOBSEEKER'
        );
      }
  
      // Generate JWT tokens
      const payload = { id: user.id, roleName: user.roleName, email: user.email };
      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h'
      });
      
      const refresh_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d'
      });
  
      return {
        access_token,
        refresh_token
      };
    } catch (error) {
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }
}
