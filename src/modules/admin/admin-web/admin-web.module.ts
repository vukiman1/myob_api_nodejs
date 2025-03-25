import { Module } from '@nestjs/common';
import { AdminWebService } from './admin-web.service';
import { AdminWebController } from './admin-web.controller';

@Module({
  controllers: [AdminWebController],
  providers: [AdminWebService],
})
export class AdminWebModule {}
