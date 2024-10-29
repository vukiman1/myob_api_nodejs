import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"

export class JobSeekerLoginDto {}

export class JobSeekerRegisterDto {  
    @ApiProperty({ example: 'example@example.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    fullName: string

    @IsNotEmpty()
    @IsStrongPassword()
    password: string

    @IsNotEmpty()
    @IsStrongPassword()
    confirmPassword: string
}