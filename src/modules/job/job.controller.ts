import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JobService } from './job.service';

import { CreateJobPostDto } from './dto/job-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('job/web')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('private-job-posts')
  async createPrivateJobPost(@Req() req: any, @Body() createJobPostDto: CreateJobPostDto) {
    const newJob = await this.jobService.createPrivateJobPost(createJobPostDto, req.user.email)
    return {
      errors: {},
      data: newJob
    }
  }


}
