import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { TypeEnums } from '../entities/notifications.entity';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsBoolean()
    isRead?: boolean;

    @IsNotEmpty()
    @IsEnum(TypeEnums)
    type: TypeEnums;
}
