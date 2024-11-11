import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";
import { CompanyDto } from "src/modules/info/dto/company.dto";

export class EmployerRegisterDto {
//user
    @IsString()
    fullName: string;
  
    @IsString()
    email: string;
  
    @IsString()
    password: string;
  
    @IsString()
    confirmPassword: string;

    @IsString()
    roleName: string = "Employer";
//company
    @ValidateNested()
    @Type(() => CompanyDto)
    company: CompanyDto;

  }