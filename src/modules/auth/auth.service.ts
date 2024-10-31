import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';
import { ErrorEnum } from 'src/constants/error-code.constant';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
      ) {}

      //Job Seeker
      async job_seeker_register_services(jobSeekerRegisterDto: JobSeekerRegisterDto) {
        const user = await this.findUserByEmail(jobSeekerRegisterDto.email)
        if (user) {
           throw new ConflictException(ErrorEnum.SYSTEM_USER_EXISTS);
        }
        const new_job_seeker = this.userRepository.create({  ...jobSeekerRegisterDto });
        return this.userRepository.save(new_job_seeker);
      }



      //Employee
      //all

        async findUserByEmail(email:string):Promise<User> {
        return this.userRepository.findOne({ where: { email } });
      }
    

    }