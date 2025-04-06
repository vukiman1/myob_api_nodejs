import { Controller, Get, Query } from '@nestjs/common';
import { AdminWebService } from './admin-web.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Controller('admin-web')
export class AdminWebController {
  constructor(private readonly adminWebService: AdminWebService) {}
  
  
  @Get('dashboard')
  async getDashboardData() {
    return this.adminWebService.dashBoardData();
  }
}
