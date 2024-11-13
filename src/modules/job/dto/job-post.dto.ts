import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsDateString, isEmail, IsEmail, IsNumber, IsString, ValidateNested } from "class-validator";
import { CreateJobLocationDto, CreateLocationDto } from "src/modules/common/dto/location.dto";

export class CreateJobPostDto {

    @IsNumber()
    academicLevel: number;

    @IsString()
    benefitsEnjoyed: string;
    slug: string;

    @IsNumber()
    career: number;

    @IsString()
    contactPersonName: string;

    @IsEmail()
    contactPersonEmail:string

    @IsString()
    contactPersonPhone: string

    @IsDate()
    deadline: Date;

    @IsNumber()
    experience: number;

    @IsString()
    genderRequired: string;

    @IsBoolean()
    isUrgent: boolean;

    @IsString()
    jobDescription: string;

    @IsString()
    jobName: string;

    @IsString()
    jobRequirement: string;

    @IsString()
    jobType: string;

    @IsNumber()
    position: number;

    @IsNumber()
    quantity: number;

    @IsNumber()
    salaryMax: number;

    @IsNumber()
    salaryMin: number;

    @IsNumber()
    typeOfWorkplace: number;

    @ValidateNested()
    @Type(() => CreateLocationDto)
    location: CreateJobLocationDto;
  }

  export class JobPostResponseDto {
    static toResponse(jobPost: any) {
      return {
        id: jobPost.id,
        slug: jobPost.slug,
        jobName: jobPost.jobName,
        deadline: jobPost.deadline,
        quantity: jobPost.quantity,
        genderRequired: jobPost.genderRequired,
        jobDescription: jobPost.jobDescription,
        jobRequirement: jobPost.jobRequirement,
        benefitsEnjoyed: jobPost.benefitsEnjoyed,
        career: jobPost.career,
        position: jobPost.position,
        typeOfWorkplace: jobPost.typeOfWorkplace,
        experience: jobPost.experience,
        academicLevel: jobPost.academicLevel,
        salaryMin: jobPost.salaryMin,
        salaryMax: jobPost.salaryMax,
        jobType: jobPost.jobType,
        isHot: jobPost.isHot,
        isUrgent: jobPost.isUrgent,
        contactPersonName: jobPost.contactPersonName,
        contactPersonEmail: jobPost.contactPersonEmail,
        contactPersonPhone: jobPost.contactPersonPhone,
        location: {
          city: jobPost.location.city.id,
          district: jobPost.location.district.id,
          address: jobPost.location.address,
          lat: jobPost.location.lat,
          lng: jobPost.location.lng,
        },
        createdAt: jobPost.createdAt,
        updatedAt: jobPost.updatedAt,
        appliedNumber: 0,
        isSaved: false,
        isApplied: false,
        companyDict: {
          id: jobPost.company.id,
          companyName: jobPost.company.companyName,
          slug: jobPost.company.slug,
          employeeSize: jobPost.company.employeeSize,
          companyImageUrl: jobPost.company.companyImageUrl
        },
        locationDict: {
          city: jobPost.location.city.id,
        },
        views: jobPost.views,
        isExpired: true,
    }
  }

}