import { Module } from '@nestjs/common';
import { AdminWebService } from './admin-web.service';
import { AdminWebController } from './admin-web.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { JobSeekerProfile } from 'src/modules/info/entities/job_seeker_profle.entities';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { Company } from 'src/modules/info/entities/company.entity';
import { JobPostActivity } from 'src/modules/job/entities/job-post-activity.entity';
import { Resume } from 'src/modules/info/entities/resume.entity';
import { Career } from 'src/modules/common/entities/carrer.entity';
import { CompanyFollowed } from 'src/modules/info/entities/company-followed.entity';
import { WebNotification } from 'src/modules/myjob/entities/notifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, JobSeekerProfile, JobPost, Company, JobPostActivity, Resume, Career, CompanyFollowed, WebNotification])],
  controllers: [AdminWebController],
  providers: [AdminWebService],
})
export class AdminWebModule {}
