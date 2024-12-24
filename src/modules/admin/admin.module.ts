import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AdminJobController } from './controllers/admin-job.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminUserService } from './services/admin-user.service';
import { AdminJobService } from './services/admin-job.service';
import { JobPost } from '../job/entities/job-post.entity';
import { Career } from '../common/entities/carrer.entity';
@Module({
  imports: [
  TypeOrmModule.forFeature([
        User,
        JobPost,
        Career
      ])
    ],
  controllers: [AdminController, AdminJobController, AdminUserController],
  providers: [AdminService, AdminUserService, AdminJobService],
})
export class AdminModule {}
