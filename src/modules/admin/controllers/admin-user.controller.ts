import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminUserService } from '../services/admin-user.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'))
// @Roles(Role.SUPPERADMIN)
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get(':id')
  async getUserDetails(@Param('id', ParseIntPipe) id: number) {
    return this.adminUserService.getUserDetails(id);
  }

  @Get()
  async getUsers(
    @Query('search') search?: string,
    @Query('roleName') roleName?: string,
    @Query('isVerifyEmail') isVerifyEmail?: boolean,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminUserService.getUsers({
      search,
      roleName,
      isVerifyEmail,
      isActive,
      page,
      pageSize,
    });
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminUserService.createUser(createUserDto);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminUserService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminUserService.deleteUser(id);
  }
}
