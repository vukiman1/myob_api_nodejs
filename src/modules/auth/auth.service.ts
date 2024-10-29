import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
      ) {}
      async job_seeker_register_services(jobSeekerRegisterDto: JobSeekerRegisterDto) {
        const new_job_seeker = this.userRepository.create({  ...jobSeekerRegisterDto });
        return this.userRepository.save(new_job_seeker);
      }
    
}
