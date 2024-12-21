import { IsInt, IsString, IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt()
  salaryMin: number;

  @Type(() => Number)
  @IsInt()
  salaryMax: number;

  @Type(() => Number)
  @IsInt()
  position: number;

  @Type(() => Number)
  @IsInt()
  experience: number;

  @Type(() => Number)
  @IsInt()
  academicLevel: number;

  @Type(() => Number)
  @IsInt()
  typeOfWorkplace: number;

  @Type(() => Number)
  @IsInt()
  jobType: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  city: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  career: number;
}
