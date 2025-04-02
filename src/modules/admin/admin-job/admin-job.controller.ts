import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminJobService } from './admin-job.service';
import { UpdateJobPostDto } from './dto/update-job-post.dto';

@Controller('admin-job')
export class AdminJobController {
  constructor(private readonly adminJobService: AdminJobService) {}

  @Get(':id')
  async getJobDetail(@Param('id') id: string) {
    console.log('id', id);
    const job = await this.adminJobService.getJobDetail(id);
    return job;
  }

  @Patch("update/:id")
  update(@Param('id') id: string, @Body() updateJobPostDto: UpdateJobPostDto) {
    return this.adminJobService.updateJobPost(id, updateJobPostDto)
  }


}
