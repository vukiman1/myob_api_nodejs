import { IsBoolean, IsEmail, IsString } from "class-validator";

export class EmployeeSendEmailDto {
    @IsEmail()
    email: string;
    @IsString()
    content: string;
    @IsString()
    fullName: string;
    @IsBoolean()
    isSendMe: boolean;
    @IsString()
    title: string;
}