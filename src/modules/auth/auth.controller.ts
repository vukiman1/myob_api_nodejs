import { Body, Controller, Get, HttpCode, HttpStatus, Options, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';
import { AuthCredDto, AuthGetTokenDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  //Job Seaker
  @Post('job-seeker/register')
  async JobSeakerRegister(@Body() jobSeekerRegisterDto: JobSeekerRegisterDto):Promise<any> {
    const newJobSeeker = await this.authService.job_seeker_register_services(jobSeekerRegisterDto);
    return {
      message: 'Register successfully',
      user: newJobSeeker
    };
  }

  
  @Options('job-seeker/register')
  @HttpCode(204) // 204 No Content for OPTIONS requests
  jobSeakerRegisterOptions() {
    return; // No content, just provides allowed methods and headers in the response
  }




  //Employee
  @Post('employee/register')
  EmployeeRegister(@Body() authRegisterDto: any) {
    return 'employee_register';
  }


  //user
  @UseGuards(AuthGuard('jwt'))
  @Get('user-info')
  async getUserInfo(@Req() req: any): Promise<any> {
    // console.log(req.user.roleName)
    const user = await this.authService.get_user_info(req.user.email);
    return {
      errors: {},
      data: user
    }
  }


  @HttpCode(HttpStatus.OK)
  @Post('check-creds')
  async jobSeakerCheckCreds(@Body() authCredDto: AuthCredDto):Promise<any> {
    const data = await this.authService.check_creds_services(authCredDto);
    return {
      errors: {},
      data
    };
  }

  
  @Post('token')
  async getToken(@Body() authGetTokenDto: AuthGetTokenDto):Promise<any> {

    const data = await this.authService.get_token_services(authGetTokenDto);
    return {
      errors: {},
      data
    };
  }


  @Post('revoke-token')
  async revokeToken(token:string):Promise<any> {
    console.log(token);
    // const data = await this.authService.revokeToken(token);
    return true
  }



  @UseGuards(AuthGuard('jwt'))
  @Get('settings')
  async getUserSetting(@Req() req: any): Promise<any> {
    return {
      errors: {},
      data: {
        emailNotificationActive: true,
        smsNotificationsActive: true //
      }
    }
  }
}




