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
  }