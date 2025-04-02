import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';

import { Repository } from 'typeorm';
import { AuthService } from './../../auth/auth.service';
import { CreateUserDto, RoleName } from './dto/create-user.dto';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';

@Injectable()
export class AdminUserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(User)
        private readonly jobSeekerProfileRepository: Repository<JobSeekerProfile>,
        private readonly authService: AuthService
      ) {}
    async getUsersInfo(id: string) {
        return this.userRepository.find({
            where: { id },
            relations: ['jobSeekerProfile', 'company'],
        });
    }

    async blockUser(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        user.isActive =  !user.isActive;
        await this.userRepository.save(user);
    }
    async getUserDetails(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['jobSeekerProfile', 'company'],
        });
        return user;
    }

    async adminlogin(loginDto: any) {
        const data = await this.authService.validateAdmin(loginDto)
        return data
    }

    async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
        const user = await this.userRepository.findOne({
          where: { id },
          relations: ["jobSeekerProfile"],
        })
    
        if (!user) {
          throw new Error("User not found")
        }
    
        // Update basic user properties
        if (updateUserDto.avatarUrl) user.avatarUrl = updateUserDto.avatarUrl
        if (updateUserDto.birthday) user.jobSeekerProfile.birthday = new Date(updateUserDto.birthday)
        if (updateUserDto.email) user.email = updateUserDto.email
        if (updateUserDto.fullName) user.fullName = updateUserDto.fullName
        if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive
        if (updateUserDto.isVerifyEmail !== undefined) user.isVerifyEmail = updateUserDto.isVerifyEmail
        if (updateUserDto.money !== undefined) user.money = updateUserDto.money
    
        // Handle job seeker profile updates
        if (updateUserDto.jobSeekerProfile && user.roleName === RoleName.JOB_SEEKER) {
          if (!user.jobSeekerProfile) {
            // Create new profile if it doesn't exist
            const jobSeekerProfile = new JobSeekerProfile()
            jobSeekerProfile.gender = updateUserDto.jobSeekerProfile.gender
            jobSeekerProfile.maritalStatus = updateUserDto.jobSeekerProfile.maritalStatus
            jobSeekerProfile.phone = updateUserDto.jobSeekerProfile.phone
    
            const savedProfile = await this.jobSeekerProfileRepository.save(jobSeekerProfile)
            user.jobSeekerProfile = savedProfile
          } else {
            // Update existing profile
            if (updateUserDto.jobSeekerProfile.gender) user.jobSeekerProfile.gender = updateUserDto.jobSeekerProfile.gender
            if (updateUserDto.jobSeekerProfile.maritalStatus)
              user.jobSeekerProfile.maritalStatus = updateUserDto.jobSeekerProfile.maritalStatus
            if (updateUserDto.jobSeekerProfile.phone) user.jobSeekerProfile.phone = updateUserDto.jobSeekerProfile.phone
    
            await this.jobSeekerProfileRepository.save(user.jobSeekerProfile)
          }
        }
    
        return this.userRepository.save(user)
      }
    
}
