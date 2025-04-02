import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { AdminUserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/modules/user/entities/user.entity';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {
   
  }

  @Post('login')
  async adminLogin(@Body() loginDto: any) {
    const user = await this.adminUserService.adminlogin(loginDto)
    return user
  }

  @Get('info/:id')
  async getUsersInfo(@Param('id') id: string) {
    const users = await this.adminUserService.getUsersInfo(id);
    return users;
  }

  @Patch('block-user/:id')
  async blockUser(@Param('id') id: string) {
    const users = await this.adminUserService.blockUser(id);
    return users;
  }

  @Get('user-details/:id')
  async getUserDetails(@Param('id') id: string) {
    const userDetails = await this.adminUserService.getUserDetails(id);
    return userDetails;
  }

  @Put("info/:id")
  async update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>): Promise<User> {
    return this.adminUserService.update(id, updateUserDto)
  }
}
