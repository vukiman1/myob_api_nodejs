import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminJobService } from '../services/admin-job.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Controller('admin/jobs')
@UseGuards(AuthGuard('jwt'))
// @Roles(Role.SUPPERADMIN)
export class AdminJobController {
  constructor(private readonly adminJobService: AdminJobService) {}

  @Get()
  async getJobs(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminJobService.getJobs({
      search,
      status,
      page,
      pageSize,
    });
  }

  @Get(':id')
  async getJobDetails(@Param('id', ParseIntPipe) id: number) {
    return this.adminJobService.getJobDetails(id);
  }

  @Put(':id/status')
  async updateJobStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.adminJobService.updateJobStatus(id, status);
  }

  @Delete(':id')
  async deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.adminJobService.deleteJob(id);
  }
}
