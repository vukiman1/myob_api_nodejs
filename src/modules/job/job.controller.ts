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

  @UseGuards(AuthGuard('jwt'))
  @Get('private-job-posts')
  async getPrivateJobPosts(
    @Req() req: any,
    @Query('isUrgent') isUrgent: boolean = null,
    @Query('kw') keyword: string = "",
    @Query('ordering') ordering: string = "createAt",
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId ,
  ) {
    const jobPosts = await this.jobService.findPrivateJobPosts({
      userId: req.user.id ,
      isUrgent,  
      keyword,     
      ordering,   
      page , 
      pageSize ,
      statusId
    });
  
    return {
      errors: {},
      data: {
        count: jobPosts.count,
        results: jobPosts.results,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private-job-posts/export')
  async getPrivateJobPostsExport(
    @Req() req: any,
    @Query('isUrgent') isUrgent: boolean = false,
    @Query('kw') keyword: string = "",
    @Query('ordering') ordering: string = "createAt",
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId = 1,
  ) {
    const jobPosts = await this.jobService.findPrivateJobPostsToExport({
      userId: req.user.id ,
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

  @UseGuards(AuthGuard('jwt'))
  @Get('private-job-posts/:id')
  async getPrivateJobPostById( @Req() req: any, @Param('id') id: string) {
    console.log(id);
    const jobPost = await this.jobService.getPrivateJobPostById(+id,  req.user.id );
    return {
      errors: {},
      data: jobPost,
    }
  }

  @Get('job-posts')
  async getJobPosts(
    @Query('isUrgent') isUrgent: boolean,
    @Query('careerId') careerId: number,
    @Query('companyId') companyId: number,
    @Query('kw') keyword: string = "",
    @Query('ordering') ordering: string = "createAt",
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId: number,
  ) {
    const jobPosts = await this.jobService.findJobPosts({
      isUrgent,  
      careerId,
      companyId,
      keyword,     
      ordering,   
      page, 
      pageSize,
      statusId
    });
  
    return {
      errors: {},
      data: {
        count: jobPosts.count,
        results: jobPosts.results,
      },
    };


    
  }

}
