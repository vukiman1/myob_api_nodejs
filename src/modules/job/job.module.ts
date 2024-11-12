import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Company } from '../info/entities/company.entity';
import { Location } from '../common/entities/location.entity';
import { CompanyImage } from '../info/entities/company-image.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User,  Company, Location, CompanyImage]),
    UserModule
  ],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
