import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { JobService } from './job.service';

import { CreateJobPostDto } from './dto/job-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateJobPostActivityDto } from './dto/create-job-post-activity.dto';
import { error } from 'console';
import { CreateJobPostNotificationDto } from './dto/create-job-post-notification.dto';
import { UpdateApplicationStatusDto } from './dto/activity-status.dto';
import { EmployeeSendEmailDto } from './dto/employee-send-email.dto';
import { MyjobService } from '../myjob/myjob.service';
import { TypeEnums } from '../myjob/entities/notifications.entity';

@Controller('job/web/')
export class JobController {
  constructor(private readonly jobService: JobService,
        private readonly myJobService: MyjobService
    

  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('private-job-posts')
  async createPrivateJobPost(
    @Req() req: any,
    @Body() createJobPostDto: CreateJobPostDto,
  ) {
    const newJob = await this.jobService.createPrivateJobPost(
      createJobPostDto,
      req.user.email,
    );

    await this.myJobService.createNotification(
      {
        title: `Việc làm mới`,
        message: `Công ty ${newJob.companyDict.companyName} vừa thêm 1 việc làm mới`,
        imageUrl: newJob.companyDict.companyImageUrl,
        type: TypeEnums.info,
      }
    )
    return {
      errors: {},
      data: newJob,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private-job-posts/suggested-job-posts')
  async getSuggestedJobPosts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() req: any, // UserId lấy từ token trong `req.user`
  ) {
    const userId = req.user.id;
    const result = await this.jobService.getSuggestedJobPosts(page, pageSize, userId);

    return result
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('private-job-posts')
  async getPrivateJobPosts(
    @Req() req: any,
    @Query('isUrgent') isUrgent: boolean = null,
    @Query('kw') keyword: string = '',
    @Query('ordering') ordering: string = 'createAt',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId,
  ) {
    const jobPosts = await this.jobService.findPrivateJobPosts({
      userId: req.user.id,
      isUrgent,
      keyword,
      ordering,
      page,
      pageSize,
      statusId,
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
    @Query('kw') keyword: string = '',
    @Query('ordering') ordering: string = 'createAt',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize = 5,
    @Query('statusId') statusId = 1,
  ) {
    const jobPosts = await this.jobService.findPrivateJobPostsToExport({
      userId: req.user.id,
      isUrgent: isUrgent,
      keyword: keyword,
      ordering: ordering,
      page: page,
      pageSize: pageSize,
      statusId: statusId,
    });

    return {
      errors: {},
      data: jobPosts.data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private-job-posts/:id')
  async getPrivateJobPostById(@Req() req: any, @Param('id') id: string) {
    const jobPost = await this.jobService.getPrivateJobPostById(
      +id,
      req.user.id,
    );
    return {
      errors: {},
      data: jobPost,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('private-job-posts/:id')
  async updatePrivateJobPostById(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateJobPostDto: CreateJobPostDto,
  ) {
    const jobPost = await this.jobService.updatePrivateJobPostById(
      +id,
      req.user.id,
      updateJobPostDto,
    );

    await this.myJobService.createNotification(
      {
        title: `Cập nhật bài đăng`,
        message: `Nhà tuyển dụng ${req.user.fullName} vừa cập nhật bài tuyển dụng`,
        imageUrl: jobPost.companyDict.companyImageUrl,
        type: TypeEnums.success,
      })
    return {
      errors: {},
      data: jobPost,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('private-job-posts/:id')
  async deletePrivateJobPost(
    @Param('id') id: number,
    @Req() req: any
  ): Promise<any> {
    return await this.jobService.deletePrivateJobPost(id, req.user.id);
  }

  @Get('job-posts')
  async getJobPosts(
    @Query('isUrgent') isUrgent: boolean,
    @Query('careerId') careerId: number,
    @Query('companyId') companyId: number,
    @Query('kw') keyword: string = '',
    @Query('ordering') ordering: string = 'createAt',
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
      statusId,
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
  @Get('job-posts/job-posts-saved')
  async getSavedJobPosts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() req: any, // Giả định userId có trong token
  ) {
    const userId = req.user.id; // Lấy userId từ token
    const result = await this.jobService.getSavedJobPosts(page, pageSize, userId);
    return {
      errors: {},
      data: result,
    };
  }


  @Get('job-posts/:slug')
  async getPublicCompany(@Param('slug') slug: string, @Req() req: any) {
    const result = await this.jobService.getPublicJobPost(slug, req.headers);
    return {
      errors: {},
      data: result,
    };
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('job-posts/:slug/job-saved/')
  async savedJobPost(@Param('slug') slug: string, @Req() req: any) {
    const result = await this.jobService.savedJobPost(slug, req.user.id);
    return {
      errors: {},
      data: {
        isSaved: result
      },
        
    };
  }

  @Post('job-seeker-job-posts-activity')
  async createJobPostActivity(@Body() createJobPostActivityDto: CreateJobPostActivityDto) {

      const result = await this.jobService.createJobPostActivity(createJobPostActivityDto);
      await this.myJobService.createNotification(
      {
        title: `Ứng viên ứng tuyển việc làm`,
        message: `Ứng viên vừa ứng tuyển vị trí ${result.jobPost.jobName}`,
        imageUrl: result.user.avatarUrl,
        type: TypeEnums.info,
      }
    )
      return {
        errors: {},
        data: result,
      }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('job-seeker-job-posts-activity')
  async getJobPostActivities(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<any> {
    const result = await this.jobService.getJobPostActivities(page, pageSize, req.user.id);
    return {
      errors: {},
      data: result,
    };
  }



  @Get('job-post-notifications')
  async getJobPostNotifications(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 12
  ) {
    const result = await this.jobService.getJobPostNotifications(page, pageSize);
    return {
      errors: {},
      data: result,
    };
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('job-post-notifications')
  async createJobPostNotification(
    @Req() req: any,
    @Body() createJobPostNotificationDto: CreateJobPostNotificationDto,
  ) {
    const result = await this.jobService.createJobPostNotification(createJobPostNotificationDto, req.user.id,);
    return {
      errors: {},
      data: result,
    };
  }

  @Put('job-post-notifications:id/active')
  async toggleActiveStatus(@Param('id') id: number) {
    const result = await this.jobService.toggleActiveStatus(id);
    return {
      errors: {},
      data: { isActive: result.isActive },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('employer-job-posts-activity')
  async getEmployerJobPostsActivity(
    @Req() req: any,
    @Query('academicLevelId') academicLevelId?: number,
    @Query('careerId') careerId?: number,
    @Query('cityId') cityId?: number,
    @Query('experienceId') experienceId?: number,
    @Query('genderId') genderId?: string,
    @Query('jobPostId') jobPostId?: number,
    @Query('jobTypeId') jobTypeId?: number,
    @Query('maritalStatusId') maritalStatusId?: number,
    @Query('positionId') positionId?: number,
    @Query('status') status?: number,
    @Query('typeOfWorkplaceId') typeOfWorkplaceId?: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 5,
  ) {
    const filters = {
      academicLevelId,
      careerId,
      cityId,
      experienceId,
      genderId,
      jobPostId,
      jobTypeId,
      maritalStatusId,
      positionId,
      status,
      typeOfWorkplaceId,
    };

    const result = await this.jobService.getEmployerJobPostsActivity(
      req.user.id,
      filters,
      page,
      pageSize,
    );

    return {
      errors: {},
      data: result,
    };
  }

  @Put('employer-job-posts-activity/:id/application-status/')
  async updateApplicationStatus(
    @Param('id') id: number,
    @Body() payload: UpdateApplicationStatusDto,
  ): Promise<any> {
    await this.jobService.updateApplicationStatus(id, payload.status);
    return { errors: {}, data: null };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('employer-job-posts-activity/:id/send-email')
  async employeeSendEmail(@Req() req:any, @Param('id') id: number,@Body() employeeSendEmailDto: EmployeeSendEmailDto) {
      const result = await this.jobService.employeeSendEmail(employeeSendEmailDto, id, req.user.email);
      return {
        errors: {},
        data: result,
      }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/statistics/job-seeker-total-view')
  async getJobSeekerTotalView(@Req() req:any): Promise<any> {
    const data = await this.jobService.getJobSeekerTotalView(req.user.id);
    return {
      errors: {},
      data: {
        totalView: data
      }
    }
  }



  @UseGuards(AuthGuard('jwt'))
  @Get('statistics/job-seeker-general-statistics/')
  async getJobSeekerGeneralStatistics(@Req() req: any): Promise<any> {
     const data = await this.jobService.getJobSeekerGeneralStatistics(req.user.id);
     return data
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('statistics/job-seeker-activity-statistics')
  async getJobSeekerActivityStatistics(
    @Req() req: any,
  ): Promise<any> {
    try {
      const userId = req.user.id;

      // Lấy thống kê ứng tuyển, lưu công việc và công ty đang theo dõi
      const statistics = await this.jobService.getJobSeekerActivityStatistics(userId);

      return {
        errors: {},
        data: statistics,
      };
    } catch (error) {
      console.error('Error in getJobSeekerActivityStatistics:', error);
      return {
        errors: { message: 'Failed to fetch activity statistics.' },
        data: null,
      };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('statistics/employer-general-statistics/')
    async getEmployerGeneralStatistics(@Req() req: any): Promise<any> {
      const userId = req.user.id; // Lấy userId từ AuthGuard
      return await this.jobService.getEmployerGeneralStatistics(userId);
    }


  @UseGuards(AuthGuard('jwt'))
  @Post('statistics/employer-recruitment-statistics')
    async getEmployerRecruitmentStatistics(
      @Req() req: any,
      @Body() body: { startDate: string; endDate: string },
    ) {
      const userId = req.user.id; // Lấy user ID từ token
      const { startDate, endDate } = body; // Nhận dữ liệu từ payload
      const statistics = await this.jobService.getEmployerRecruitmentStatistics(
        userId,
        startDate,
        endDate,
      );
      return { errors: {}, data: statistics };
    }

  @UseGuards(AuthGuard('jwt'))
  @Post('statistics/employer-recruitment-statistics-by-rank')
    async getRecruitmentStatisticsByRank(
      @Body('startDate') startDate: string,
      @Body('endDate') endDate: string,
      @Req() req: any
    ) {
      const userId = req.user.id; // Lấy userId từ auth guard
      const data = await this.jobService.getRecruitmentStatisticsByRank(
        userId,
        startDate,
        endDate
      );
      return { errors: {}, data: data };
    }

  @UseGuards(AuthGuard('jwt'))
  @Post('statistics/employer-application-statistics')
    async getEmployerApplicationStatistics(
      @Req() req: any,
      @Body('startDate') startDate: string,
      @Body('endDate') endDate: string,
    ) {
      return await this.jobService.getEmployerApplicationStatistics(
        req.user.id,
        startDate,
        endDate,
      );
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('statistics/employer-candidate-statistics')
    async getEmployerCandidateStatistics(
      @Req() req: any,
      @Body('startDate') startDate: string,
      @Body('endDate') endDate: string,
    ) {
      return this.jobService.getEmployerCandidateStatistics(
        req.user.id,
        startDate,
        endDate,
      );
    }

   @Get('admin/getAllJobPost')
    async getAllJobPost() {
      return await this.jobService.getAllJobPost();
    }
    
}
