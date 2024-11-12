<<<<<<< HEAD
import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNumber, IsDateString, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateLocationDto } from 'src/modules/common/dto/location.dto';
export class CreateCompanyDto {
    @IsEmail()
    companyEmail: string;
  
    @IsString()
    companyName: string;
  
    @IsString()
    companyPhone: string;
  
    @IsNumber()
    employeeSize: number;
  
    @IsString()
    fieldOperation: string;
  
    @ValidateNested()
    @Type(() => CreateLocationDto)
    location: CreateLocationDto;
  
    @IsString()
    address: string;
  
    @IsNumber()
    city: number;
  
    @IsNumber()
    district: number;
  
    @IsDateString()
    since: string;
  
    @IsString()
    taxCode: string;
  
    @IsString()
    websiteUrl: string;
  
    @IsString()
    fullName: string;
  
    @IsString()
    email: string;
  
    @IsString()
    password: string;
  
    @IsString()
    confirmPassword: string;
  
    @IsString()
    platform: string;
=======
import { Type } from "class-transformer";
import { IsDateString, IsEmail, IsNumber, IsString, ValidateNested } from "class-validator";
import { CreateLocationDto } from "src/modules/common/dto/location.dto";

export class CompanyDto {
    @IsEmail()
    companyEmail: string;

    @IsString()
    companyName: string;

    slug: string;

    @IsString()
    companyPhone: string;

    @IsNumber()
    employeeSize: number;

    @IsString()
    fieldOperation: string;

    @ValidateNested()
    @Type(() => CreateLocationDto)
    location: CreateLocationDto;

    @IsDateString()
    since: string;

    @IsString()
    taxCode: string;

    @IsString()
    websiteUrl: string;
>>>>>>> 622c6748fbae3e206025ea8496a34e0bef6623cd
  }