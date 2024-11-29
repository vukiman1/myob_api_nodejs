import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthCredDto {
  @ApiProperty({
    example: 'anvu734@gmail.com',
    description: 'Email của người dùng',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @IsNotEmpty()
  @ApiProperty({ example: 'JOB_SEEKER', description: 'Loại người dùng' })
  roleName: string;
}

export class AuthGetTokenDto {
  @ApiProperty({
    example: 'anvu734@gmail.com',
    description: 'Email của người dùng',
  })
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty({ example: 'JOB_SEEKER', description: 'Loại tài khoản' })
  @IsNotEmpty()
  role_name: string;

  @ApiProperty({ example: 'An@01022002', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty()
  password: string;
}
