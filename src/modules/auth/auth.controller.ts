import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JobSeekerRegisterDto } from './dto/job_seaker-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Job Seaker
  @Post('job-seaker/register')
  async job_seaker_register(@Body() jobSeekerRegisterDto: JobSeekerRegisterDto):Promise<any> {
    const newJobSeeker = await this.authService.job_seeker_register_services(jobSeekerRegisterDto);
    return {
      message: 'Register successfully',
      user: newJobSeeker
    };
  }

  @Post('check-creds')
  async job_seaker_login(@Body() jobSeekerRegisterDto: JobSeekerRegisterDto):Promise<any> {
    return {
      message: 'Login successfully',
      user: {} 
    };
  }



  //Employee
  @Post('employee/register')
  employee_register(@Body() authRegisterDto: any) {
    return 'employee_register';
  }
}
function job_seeker_register_services() {
  throw new Error('Function not implemented.');
}

