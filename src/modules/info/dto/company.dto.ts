import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import moment from "moment";
import { CreateLocationDto, CreateLocationDto2, UploadLocationDto } from "src/modules/common/dto/location.dto";

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
    location: CreateLocationDto2;

    @IsDateString()
    since: string;

    @IsString()
    taxCode: string;

    @IsString()
    websiteUrl: string;
  }


  export class UpdateCompanyDto { 
   
    @IsEmail()
    companyEmail: string;
    
    @IsString()
    companyName: string; 
    
    @IsString()
    slug: string; 
    
    @IsString()
    companyPhone: string; 
    
    @IsNumber()
    employeeSize: number; 
    
    @IsString()
    fieldOperation: string; 
    @ValidateNested()
    @Type(()=> CreateLocationDto2) location: CreateLocationDto2; 
    
    @IsDateString()
    since: string; 
    
    @IsString()
    taxCode: string; 
    
    @IsString()
    websiteUrl: string; 
    
    @IsString()
    companyCoverImageUrl: string; 
    
    @IsString()
    companyImageUrl: string; 
    
    @IsString()
    description: string; 
    
    @IsOptional()
    @IsString()
    facebookUrl: string; 
    
    @IsOptional()
    @IsString()
    linkedinUrl: string; 
    
    @IsOptional()
    @IsString()
    youtubeUrl: string; 
    
    @IsNumber()
    followNumber: number; 
    
    @IsNumber()
    jobPostNumber: number; 
    
    @IsBoolean() // cần sửa đổi dựa vào cấu trúc cụ thể của đối tượng @IsString()
    isFollowed: boolean


    companyImages: string
  }
  export class CompanyResponseDto {
    static toResponse(company: any) {
      return {
        id: company.id,
        slug: company.slug,
        taxCode: company.taxCode,
        companyName: company.companyName,
        employeeSize: company.employeeSize,
        fieldOperation: company.fieldOperation,
        location: company.location ? {
          city: company.location.city?.id,
          district: company.location.district?.id,
          address: company.location.address,
          lat: company.location.lat,
          lng: company.location.lng,
        } : null,
        since: company.since ? moment(company.since).format('YYYY-MM-DD') : null,
        companyEmail: company.companyEmail,
        companyPhone: company.companyPhone,
        websiteUrl: company.websiteUrl,
        facebookUrl: company.facebookUrl,
        youtubeUrl: company.youtubeUrl,
        linkedinUrl: company.linkedinUrl,
        description: company.description,
        companyImageUrl: company.companyImageUrl,
        companyCoverImageUrl: company.companyCoverImageUrl,
        locationDict: { city: company.location?.city?.id },
        followNumber: company.followNumber || 0,
        jobPostNumber: company.jobPostNumber || 0,
        isFollowed: company.isFollowed || false,
        companyImages: company.companyImages?.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
        })) || null,
        mobileUserDict: company.user ? {
          id: company.user.id,
          fullName: company.user.fullName,
          email: company.user.email,
        } : null,
      };
    }
}