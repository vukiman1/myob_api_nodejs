import { isBoolean, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

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
 
    @IsNotEmpty()
    @IsString()
    imageUrl: string

    @IsNotEmpty()
    @IsString()
    buttonText: string

    @IsNotEmpty()
    @IsString()
    buttonLink: string;

    @IsNotEmpty()
    @IsString()
    description: string;

}

export class UpdateBannerDto {
    @IsOptional()
    @IsString()
    imageUrl?: string

    @IsOptional()
    @IsString()
    buttonText?: string

    @IsOptional()
    @IsString()
    buttonLink?: string;

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

