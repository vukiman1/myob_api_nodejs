import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    ValidateNested,
  } from "class-validator"
  import { Type } from "class-transformer"
  
  export enum RoleName {
    JOB_SEEKER = "JOB_SEEKER",
    EMPLOYER = "EMPLOYER",
  }
  
  export enum Gender {
    M = "M",
    F = "F",
    O = "O",
  }
  
  export enum MaritalStatus {
    S = "S",
    M = "M",
    D = "D",
    W = "W",
  }
  
  export class JobSeekerProfileDto {
    @IsEnum(Gender)
    gender: Gender
  
    @IsEnum(MaritalStatus)
    maritalStatus: MaritalStatus
  
    @IsString()
    phone: string
  }
  
  export class CreateUserDto {
    @IsUrl()
    avatarUrl: string
  
    @IsISO8601()
    @IsOptional()
    birthday?: string
  
    @IsEmail()
    email: string
  
    @IsString()
    fullName: string
  
    @IsBoolean()
    isActive: boolean
  
    @IsBoolean()
    isVerifyEmail: boolean
  
    @IsNumber()
    money: number
  
    @IsEnum(RoleName)
    roleName: RoleName
  
    @ValidateNested()
    @Type(() => JobSeekerProfileDto)
    @IsOptional()
    jobSeekerProfile?: JobSeekerProfileDto
  }
  
  