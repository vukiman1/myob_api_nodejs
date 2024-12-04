import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateJobPostActivityDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsNumber()
  job_post: number;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  resume: string;
}