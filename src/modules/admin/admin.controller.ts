import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
// @Roles(Role.SUPPERADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

}
