import { Controller, Get } from '@nestjs/common';
import { AdminUserService } from './user.service';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {
   
  }

  @Get('info')
  async getUsersInfo() {
    const users = await this.adminUserService.getUsersInfo();
    return users;
  }
}
