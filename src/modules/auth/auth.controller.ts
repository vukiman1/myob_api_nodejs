import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Job Seaker
  @Post('job_seaker/register')
  job_seaker_register(@Body() authRegisterDto: any) {
    return 'job_seaker_register';
  }

  //Employee
  @Post('employee/register')
  employee_register(@Body() authRegisterDto: any) {
    return 'employee_register';
  }
}
