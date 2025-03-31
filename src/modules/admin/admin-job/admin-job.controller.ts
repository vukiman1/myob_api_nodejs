import { Controller, Get, Param } from '@nestjs/common';
import { AdminJobService } from './admin-job.service';

@Controller('admin-job')
export class AdminJobController {
  constructor(private readonly adminJobService: AdminJobService) {}

  @Get(':id')
  async getJobDetail(@Param('id') id: string) {
    console.log('id', id);
    const job = await this.adminJobService.getJobDetail(id);
    return job;
  }
}
