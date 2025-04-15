import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Options,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Redirect,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';
import { AuthCredDto, AuthGetTokenDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { EmployerRegisterDto } from './dto/employer-auth.dto';
import { UpDateUserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MyjobService } from '../myjob/myjob.service';
import { TypeEnums } from '../myjob/entities/notifications.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(
    private readonly authService: AuthService,
    private readonly myJobService: MyjobService
  ) {}

  //Job Seaker
  @Post('job-seeker/register')
  async JobSeakerRegister(
    @Body() jobSeekerRegisterDto: JobSeekerRegisterDto,
  ): Promise<any> {
    const newJobSeeker =
      await this.authService.job_seeker_register_services(jobSeekerRegisterDto);
      await this.myJobService.createNotification(
        {
          title: `Ứng viên đăng kí tài khoản`,
          message: `Ứng viên ${newJobSeeker.fullName} đã tạo mới tài khoản`,
          imageUrl: newJobSeeker.avatarUrl,
          type: TypeEnums.info,
        }
      )
    return {
      message: 'Register successfully',
      user: newJobSeeker,
    };
  }




  @Options('job-seeker/register')
  @HttpCode(204) // 204 No Content for OPTIONS requests
  jobSeakerRegisterOptions() {
    return; // No content, just provides allowed methods and headers in the response
  }

  //Employee

  @Post('employer/register')
  async EmployerRegister(@Body() employeeRegisterDto: EmployerRegisterDto) {
    const newEmployer =
      await this.authService.employer_register_services(employeeRegisterDto);
      await this.myJobService.createNotification(
        {
          title: `Nhà tuyển dụng đăng kí tài khoản`,
          message: `Ứng viên ${newEmployer.user.fullName} đã tạo mới tài khoản`,
          imageUrl: newEmployer.user.avatarUrl,
          type: TypeEnums.info,
        }
      )
      await this.myJobService.createNotification(
        {
          title: `Công ty mới tham gia`,
          message: `Công ty ${newEmployer.companyName} đã tham gia trang web`,
          imageUrl: newEmployer.companyCoverImageUrl,
          type: TypeEnums.info,
        }
      )
    return newEmployer;
  }

  @Get('verify-email')
  @Redirect('https://vieclam365.top/dang-nhap-ung-vien?successMessage=Email+xác+thực+thành+công')
  async verifyEmail(@Query('token') token: string) {
     await this.authService.verifyUserEmail(token)  
  }

  @Get('employee-verify-email')
  @Redirect('https://vieclam365.top/dang-nhap-nha-tuyen-dung?successMessage=Email+xác+thực+thành+công')
  async employeeVerifyEmail(@Query('token') token: string) {
    await this.authService.verifyUserEmail(token)  
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: any) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'Check your email for reset password link' };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordto: any) {
    await this.authService.resetPassword(resetPasswordto);
    return { data: {
      redirectLoginUrl: '/dang-nhap-ung-vien'
    } };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: any) {
    await this.authService.changePassword(changePasswordDto, req.user.email);
    return { message: 'Password has been updated successfully!' };
  }

  @Get('admin/user-info/:id')
  async getAdminUserInfo( @Param('id') id: number): Promise<any> {

    const user = await this.authService.getAdminUserInfo(id);
    return {
      errors: {},
      data: user,
    };
  }
  //user
  @UseGuards(AuthGuard('jwt'))
  @Get('user-info')
  async getUserInfo(@Req() req: any): Promise<any> {

    const user = await this.authService.get_user_info(req.user.email);
    return {
      errors: {},
      data: user,
    };
  }



  @Get('admin/user-list')
  async getUserList(): Promise<any> {

    const user = await this.authService.getUserList();
    return {
      errors: {},
      data: user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update-user')
  async updateUser(
    @Req() req: any,
    @Body() upDateUserDto: UpDateUserDto,
  ): Promise<any> {
    const user = await this.authService.updateUser(
      upDateUserDto,
      req.user.email,
      req.user.id,
    );
    return {
      errors: {},
      data: user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const user = await this.authService.updateAvatar(
      file,
      req.user.email,
    );
    return {
      errors: {},
      data: user,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('check-creds')
  async jobSeakerCheckCreds(@Body() authCredDto: AuthCredDto): Promise<any> {
    const data = await this.authService.check_creds_services(authCredDto);
    return {
      errors: {},
      data,
    };
  }

  @Post('token')
  async getToken(@Body() authGetTokenDto: AuthGetTokenDto): Promise<any> {
    const data = await this.authService.get_token_services(authGetTokenDto);
    return {
      errors: {},
      data,
    };
  }

  @Post('admin-login')
  async adminLogin(@Body() formData: any): Promise<any> {
    const data = await this.authService.adminLogin(formData);
    return {
      errors: {},
      data,
    };
  }



  @Post('revoke-token')
  async revokeToken(token: string): Promise<any> {

    // const data = await this.authService.revokeToken(token);
    return true;
  }

  @Post('convert-token')
  async convertGoogleToken(@Body() body: {
    backend: string;
    token: string;
    client_id: string;
    client_secret: string;
    grant_type: string;
  }) {
    const { token } = body;
    const result = await this.authService.convertGoogleToken(token);
    return {
      errors: {},
      data: {
        errors: {},
        scope: "read write",
        token_type: "Bearer",
        backend: "backend",
        ...result
      }
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('settings')
  async getUserSetting(@Req() req: any): Promise<any> {
    return {
      errors: {},
      data: {
        emailNotificationActive: true,
        smsNotificationsActive: true, //
      },
    };
  }
}
