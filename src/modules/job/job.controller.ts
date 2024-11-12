import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('job/web')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('private-job-posts')
  async createPrivateJobPost(@Body() createJobDto: CreateJobDto) {
    const newJob = await this.jobService.createPrivateJobPost()
    return {
      errors: {},
      data: newJob
    }
  }


}
