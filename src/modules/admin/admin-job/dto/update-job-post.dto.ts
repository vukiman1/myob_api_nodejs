import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    Min,
  } from "class-validator"
  import { Type } from "class-transformer"
  
  export enum GenderRequired {
    M = "M",
    F = "F",
    O = "O",
  }
 
  
  export class UpdateJobPostDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    academicLevel?: number
  
    @IsString()
    @IsOptional()
    benefitsEnjoyed?: string
  
    @IsString()
    @IsEmail()
    @IsOptional()
    contactPersonEmail?: string
  
    @IsString()
    @IsOptional()
    contactPersonName?: string
  
    @IsString()
    @IsOptional()
    contactPersonPhone?: string
  
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    deadline?: Date
  
    @IsInt()
    @IsOptional()
    experience?: number
  
    @IsEnum(GenderRequired)
    @IsOptional()
    genderRequired?: GenderRequired
  
    @IsBoolean()
    @IsOptional()
    isExpired?: boolean
  
    @IsBoolean()
    @IsOptional()
    isHot?: boolean
  
    @IsBoolean()
    @IsOptional()
    isUrgent?: boolean
  
    @IsString()
    @IsOptional()
    jobDescription?: string
  
    @IsString()
    @IsOptional()
    jobName?: string
  
    @IsString()
    @IsOptional()
    jobRequirement?: string
  
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    jobType?: number
  
    @IsInt()
    @Min(1)
    @Max(9)
    @IsOptional()
    position?: number
  
    @IsInt()
    @IsPositive()
    @IsOptional()
    quantity?: number
  
    @IsNumber()
    @IsPositive()
    @IsOptional()
    salaryMax?: number
  
    @IsNumber()
    @IsPositive()
    @IsOptional()
    salaryMin?: number
  
    @IsString()
    @IsOptional()
    slug?: string
  
    @IsInt()
    @Min(1)
    @Max(3)
    @IsOptional()
    typeOfWorkplace?: number
  }
  
  