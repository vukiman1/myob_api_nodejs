import { Module } from '@nestjs/common';
import { AdminCompanyService } from './admin-company.service';
import { AdminCompanyController } from './admin-company.controller';

@Module({
  controllers: [AdminCompanyController],
  providers: [AdminCompanyService],
})
export class AdminCompanyModule {}
