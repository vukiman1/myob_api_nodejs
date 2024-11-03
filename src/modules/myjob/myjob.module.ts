import { Module } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { MyjobController } from './myjob.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner])
  ],
  controllers: [MyjobController],
  providers: [MyjobService],
})
export class MyjobModule {}
