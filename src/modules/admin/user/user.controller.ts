import { Controller, Get, Param } from '@nestjs/common';
import { AdminUserService } from './user.service';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {
   
  }

  @Get('info/:id')
  async getUsersInfo(@Param('id') id: string) {
    const users = await this.adminUserService.getUsersInfo(id);
    return users;
  }
}
