import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"

export class JobSeekerLoginDto {
    @ApiProperty({ example: 'example@example.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsStrongPassword()
    password: string
}


export class JobSeekerRegisterDto {  
    @ApiProperty({ example: 'example@example.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({ example: 'Kim An', description: 'Tên đầy đủ của người dùng' })
    @IsNotEmpty()
    @IsString()
    fullName: string

    @ApiProperty({ example: 'KimAn@123', description: 'Mật khẩu của người dùng' })
    @IsNotEmpty()
    @IsStrongPassword()
    password: string

    @ApiProperty({ example: 'KimAn@123', description: 'Xác nhận lại mật khẩu của người dùng' })
    @IsNotEmpty()
    @IsStrongPassword()
    confirmPassword: string
}