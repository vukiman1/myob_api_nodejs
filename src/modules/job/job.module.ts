import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Company } from '../info/entities/company.entity';
import { Location } from '../common/entities/location.entity';
import { UserModule } from '../user/user.module';
import { JobPost } from './entities/job-post.entity';
import { Career } from '../common/entities/carrer.entity';
import { AuthModule } from '../auth/auth.module';
import { JobPostSaved } from './entities/job-post-saved.entity';
import { Resume } from '../info/entities/resume.entity';
import { ResumeSaved } from '../info/entities/resume-saved.entity';
import { ResumeViewed } from '../info/entities/resume-viewed.entity';
import { JobPostActivity } from './entities/job-post-activity.entity';
import { JobPostNotification } from './entities/job-post-notification.entity';
import { City } from '../common/entities/city.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Company,
      Location,
      JobPost,
      JobPostSaved,
      Career,
      Resume,
      ResumeSaved,
      ResumeViewed,
      JobPostActivity,
      JobPostNotification,
      City
    ]),
    UserModule,
    AuthModule,
  ],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
