import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { JobSeekerProfile } from '../info/entities/job_seeker_profle.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, JobSeekerProfile]),
    UserModule,
    JobSeekerProfile
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, ],
})
export class AuthModule {}
