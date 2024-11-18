import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Company } from '../info/entities/company.entity';
import { Location } from '../common/entities/location.entity';
import { CompanyImage } from '../info/entities/company-image.entity';
import { UserModule } from '../user/user.module';
import { JobPost } from './entities/job-post.entity';
import { Career } from '../common/entities/carrer.entity';
import { InfoService } from '../info/info.service';
import { InfoModule } from '../info/info.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { City } from '../common/entities/city.entity';
import { District } from '../common/entities/district.entity';
import { CompanyFollowed } from '../info/entities/company-followed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User,  Company, Location, JobPost, Career]),
    UserModule,

  ],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
