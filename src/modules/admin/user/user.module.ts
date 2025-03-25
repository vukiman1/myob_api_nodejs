import { Module } from '@nestjs/common';
import { AdminUserService } from './user.service';
import { AdminUserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService]
})
export class AdminUserModule {}
