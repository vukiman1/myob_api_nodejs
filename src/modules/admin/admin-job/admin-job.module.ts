import { Module } from '@nestjs/common';
import { AdminJobService } from './admin-job.service';
import { AdminJobController } from './admin-job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { JobPost } from 'src/modules/job/entities/job-post.entity';
import { PaymentModule } from 'src/modules/payment/payment.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, JobPost]), PaymentModule],
  controllers: [AdminJobController],
  providers: [AdminJobService],
})
export class AdminJobModule {}
