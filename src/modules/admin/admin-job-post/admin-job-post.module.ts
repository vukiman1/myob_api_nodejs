import { Module } from '@nestjs/common';
import { AdminJobPostService } from './admin-job-post.service';
import { AdminJobPostController } from './admin-job-post.controller';

@Module({
  controllers: [AdminJobPostController],
  providers: [AdminJobPostService],
})
export class AdminJobPostModule {}
