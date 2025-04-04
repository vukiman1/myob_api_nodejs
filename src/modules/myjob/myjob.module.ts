import { Global, Module } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { MyjobController } from './myjob.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { User } from '../user/entities/user.entity';
import { Feedback } from './entities/feedback.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { WebNotification } from './entities/notifications.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Banner, User, Feedback, WebNotification]),
    CloudinaryModule,
  ],
  controllers: [MyjobController],
  providers: [MyjobService],
  exports: [MyjobService]
})
export class MyjobModule {}
