import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoController } from './info.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JobSeekerProfile } from './entities/job_seeker_profle.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, JobSeekerProfile]),
    UserModule
  ],
  controllers: [InfoController],
  providers: [InfoService, UserService],

})
export class InfoModule {}
