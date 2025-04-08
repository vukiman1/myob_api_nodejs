import { Body, Controller, Get, Param, Patch, Put, Req, UseGuards } from '@nestjs/common';
import { AdminJobService } from './admin-job.service';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { UpdateStatusDto } from './dto/update-urgent.dto';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('list/:userId')
  async getJobList(@Param('userId') userId: string) {
    const jobList = await this.adminJobService.getJobList(userId);
    return {
      success: true,
      data: jobList
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update-urgent')
  async updateUrgent(@Body() {ids}: UpdateStatusDto,  @Req() req:any) {
    console.log(ids)
    const jobPost = await this.adminJobService.updateMultipleStatus(ids, req.user.id);
    return {
      success: true,
      data: jobPost
    }
  }


}
