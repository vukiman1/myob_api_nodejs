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
  async getUserInfo(@Req() req): Promise<any> {
    console.log(req.user)
    return this.authService.get_user_info();
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

//   {
//     "errors": {},
//     "data": {
//         "id": 41306,
//         "fullName": "An Vũ",
//         "email": "anvuit734@gmail.com",
//         "isActive": true,
//         "isVerifyEmail": true,
//         "avatarUrl": "https://res.cloudinary.com/dtnpj540t/image/upload/v1680687265/my-job/images_default/avt_default.jpg",
//         "roleName": "JOB_SEEKER",
//         "jobSeekerProfileId": 27869,
//         "jobSeekerProfile": {
//             "id": 27869,
//             "phone": "0385849615"
//         },
//         "companyId": null,
//         "company": null
//     }
// }
}




