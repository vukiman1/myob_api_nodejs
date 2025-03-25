import { Module } from '@nestjs/common';
import { AdminJobService } from './admin-job.service';
import { AdminJobController } from './admin-job.controller';

@Module({
  controllers: [AdminJobController],
  providers: [AdminJobService],
})
export class AdminJobModule {}
