import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"

export class AuthCredDto {
    @ApiProperty({ example: 'example@example.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    roleName: string


}

export class AuthGetTokenDto {
    @ApiProperty({ example: 'example@example.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({ example: 'JOB_SEEKER', description: 'Qu' })
    @IsNotEmpty()
    roleName: string

    @IsNotEmpty()
    password: string


}

