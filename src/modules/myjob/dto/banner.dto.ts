import { ApiProperty } from "@nestjs/swagger";
import { isBoolean, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { BannerType } from "../entities/banner.entity";

export class BannerDto {
    id: string;
    imageUrl: string
    buttonText: string
    buttonLink: string;
    description: string;
    descriptionLocation: number;
    isShowButton: boolean;
}



export class CreateBannerDto {
    @ApiProperty({ example: 'https://res.cloudinary.com/dtnpj540t/image/upload/v1687282868/my-job/banners/web-banners/5.png', description: 'Link ảnh' })
    @IsNotEmpty()
    @IsString()
    imageUrl: string

    @ApiProperty({ example: 'banner sale tháng 10', description: 'Mô tả' })
    @IsNotEmpty()
    @IsString()
    buttonText: string

    @ApiProperty({ example: 'fb.com/vukiman1', description: 'Liên kết khi bấm bảo banner' })
    @IsNotEmpty()
    @IsString()
    buttonLink: string;

    @ApiProperty({ example: 'banner sale tháng 10', description: 'Mô tả' })
    @IsNotEmpty()
    @IsString()
    description: string;

}

export class CreateBannerDto2 {
    @ApiProperty({ example: 'https://res.cloudinary.com/dtnpj540t/image/upload/v1687282868/my-job/banners/web-banners/5.png', description: 'Link ảnh' })
    @IsNotEmpty()
    @IsString()
    imageUrl: string


    @ApiProperty({ example: 'fb.com/vukiman1', description: 'Liên kết khi bấm bảo banner' })
    @IsNotEmpty()
    @IsString()
    buttonLink: string;

    @ApiProperty({ example: 'banner sale tháng 10', description: 'Mô tả' })
    @IsNotEmpty()
    @IsString()
    description: string;


    @ApiProperty({ example: true, description: 'Trạng thái', default: true })
    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean

    @ApiProperty({ example: 'BANNER', description: 'Loại banner' })
    @IsNotEmpty()
    @IsString()
    type: BannerType;

}

export class UpdateBannerDto {
    @ApiProperty({ example: 'https://res.cloudinary.com/dtnpj540t/image/upload/v1687282868/my-job/banners/web-banners/5.png', description: 'Link ảnh' })
    @IsOptional()
    @IsString()
    imageUrl?: string

    @ApiProperty({ example: 'banner sale tháng 10', description: 'Mô tả' })
    @IsOptional()
    @IsString()
    buttonText?: string

    @ApiProperty({ example: 'fb.com/vukiman1', description: 'Liên kết khi bấm bảo banner' })
    @IsOptional()
    @IsString()
    buttonLink?: string;


    @ApiProperty({ example: 'true', description: 'Trạng thái' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isShowButton?: boolean;

    @IsOptional()
    @IsNumber()
    descriptionLocation?: number;


}

