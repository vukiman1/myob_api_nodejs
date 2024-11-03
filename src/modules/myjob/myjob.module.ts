import { Module } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { MyjobController } from './myjob.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { User } from '../user/entities/user.entity';
import { Feedback } from './entities/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, User, Feedback])
  ],
  controllers: [MyjobController],
  providers: [MyjobService],
})
export class MyjobModule {}
