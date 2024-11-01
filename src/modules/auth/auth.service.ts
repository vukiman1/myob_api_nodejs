import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';
import { ErrorEnum } from 'src/constants/error-code.constant';
import { JobSeekerProfile } from '../info/entities/job_seeker_profle.entities';
import { AuthCredDto, AuthGetTokenDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        @InjectRepository(JobSeekerProfile)
        private jobSeekerProfileRepository: Repository<JobSeekerProfile>,
      ) {}

      //Job Seeker
      async job_seeker_register_services(jobSeekerRegisterDto: JobSeekerRegisterDto) {
        const user = await this.findUserByEmail(jobSeekerRegisterDto.email)
        if (user) {
           throw new ConflictException(ErrorEnum.SYSTEM_USER_EXISTS);
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(jobSeekerRegisterDto.password, salt);
        jobSeekerRegisterDto.password = hashedPassword;

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



      //Employee

      
      async findUserByEmail(email:string):Promise<User> {
        return this.userRepository.findOne({ where: { email } });
      }
      
      //all
      async get_user_info():Promise<any> {
        return {message: "ok"}
      }
      async check_creds_services(authCredDto:AuthCredDto):Promise<any> {
        const user = await this.findUserByEmail(authCredDto.email);
        if (!user || authCredDto.roleName !== user.roleName ) {
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
          refresh_token: this.jwtService.sign({ ...user }, { expiresIn: '7d' }),
          access_token: this.jwtService.sign({ ...user }), // Tạo JWT token
        };
      }
     
    }


    async validate_user(authGetTokenDto:AuthGetTokenDto): Promise<any> {
      const user = await this.findUserByEmail(authGetTokenDto.email);

      if (user && await bcrypt.compare(authGetTokenDto.password, user.password)) {
        const { id, roleName, email } = user;
        return { id, roleName, email };
      }
  
      throw new NotFoundException(`User not found!`)
    }
  }