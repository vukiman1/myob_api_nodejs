import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { JobService } from './job.service';

import { CreateJobPostDto } from './dto/job-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('job/web/')
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

  @Get('private-job-posts')
  async getPrivateJobPosts(
    @Query('isUrgent') isUrgent: boolean = false,
    @Query('kw') keyword: string = "",
    @Query('ordering') ordering: string = "createAt",
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId = 1,
  ) {
    const jobPosts = await this.jobService.findJobPosts({
      isUrgent: isUrgent,  
      keyword: keyword,     
      ordering: ordering,   
      page: page , 
      pageSize: pageSize ,
      statusId: statusId
    });
  
    return {
      errors: {},
      data: {
        count: jobPosts.count,
        results: jobPosts.results,
      },
    };
  }

  @Get('private-job-posts/export')
  async getPrivateJobPostsExport(
    @Query('isUrgent') isUrgent: boolean = false,
    @Query('kw') keyword: string = "",
    @Query('ordering') ordering: string = "createAt",
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId = 1,
  ) {
    const jobPosts = await this.jobService.findJobPostsToExport({
      isUrgent: isUrgent,  
      keyword: keyword,     
      ordering: ordering,   
      page: page , 
      pageSize: pageSize ,
      statusId: statusId
    });
  
    return {
      errors: {},
      data: jobPosts.data
    };
  }

  @Get('private-job-posts/:id')
  async getPrivateJobPostById(@Param('id') id: string) {
    const jobPost = await this.jobService.getPrivateJobPostById(+id);
    return {
      errors: {},
      data: jobPost,
    }
  }
}
