import { Module } from '@nestjs/common';
import { AdminUserService } from './user.service';
import { AdminUserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, JobSeekerProfile]), AuthModule],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService]
})
export class AdminUserModule {}
