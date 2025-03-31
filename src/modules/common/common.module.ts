import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';
import { Career } from './entities/carrer.entity';
import { Location } from './entities/location.entity';
import { JobPost } from '../job/entities/job-post.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([City, District, Career, Location, JobPost]),
    CloudinaryModule
  ],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
