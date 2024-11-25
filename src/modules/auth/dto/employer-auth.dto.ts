import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { CompanyDto } from 'src/modules/info/dto/company.dto';

export class EmployerRegisterDto {
  //user

  @ApiProperty({
    example: 'Kim An',
    description: 'Tên nhà tuyển dụng',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'employeer1@gmail.com',
    description: 'Email nhà tuyển dụng',
  })
  @IsString()
  email: string;

  @ApiProperty({
    example: 'An@01022002',
    description: 'Mật khẩu',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'An@01022002',
    description: 'Mật khẩu',
  })
  @IsString()
  confirmPassword: string;

  @IsString()
  roleName: string = 'Employer';
  //company
  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;
}
