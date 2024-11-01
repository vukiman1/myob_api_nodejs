import { Module } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { MyjobController } from './myjob.controller';

@Module({
  controllers: [MyjobController],
  providers: [MyjobService],
})
export class MyjobModule {}
