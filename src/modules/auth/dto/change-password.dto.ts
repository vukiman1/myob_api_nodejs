import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {

    @ApiProperty({ example: 'Current password' })
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({ example: 'New password' })
    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @ApiProperty({ example: 'Confirm new password' })
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}