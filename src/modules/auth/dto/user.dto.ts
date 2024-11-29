import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class UpDateUserDto {
    @ApiProperty({ example: 'anvu@gmail.com', description: 'Email của người dùng' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    fullName: string
}