import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JobSeekerProfile } from './entities/job_seeker_profle.entities';
import { Company } from './entities/company.entity';
import { Location } from '../common/entities/location.entity';
import { CompanyImage } from './entities/company-image.entity';
import { City } from '../common/entities/city.entity';
import { District } from '../common/entities/district.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, JobSeekerProfile, Company, Location, CompanyImage, City, District]),
    UserModule
  ],
  controllers: [InfoController],
  providers: [InfoService, UserService],

})
export class InfoModule {}
