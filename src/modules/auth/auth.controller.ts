import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Options,
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

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private readonly authService: AuthService) {}

  //Job Seaker
  @Post('job-seeker/register')
  async JobSeakerRegister(
    @Body() jobSeekerRegisterDto: JobSeekerRegisterDto,
  ): Promise<any> {
    const newJobSeeker =
      await this.authService.job_seeker_register_services(jobSeekerRegisterDto);
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
    return newEmployer;
  }

  @Get('verify-email')
  @Redirect('https://vieclam365.top/dang-nhap-ung-vien?successMessage=Email+xác+thực+thành+công')
  async verifyEmail(@Query('token') token: string) {
    const payload = await this.authService.verifyUserEmail(token)  
    console.log(payload);
    //This will be executed!
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

  @Post('revoke-token')
  async revokeToken(token: string): Promise<any> {

    // const data = await this.authService.revokeToken(token);
    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('settings')
  async getUserSetting(@Req() req: any): Promise<any> {
    console.log(req.user);
    return {
      errors: {},
      data: {
        emailNotificationActive: true,
        smsNotificationsActive: true, //
      },
    };
  }
}
