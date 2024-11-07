import { IsNotEmpty, IsString } from "class-validator";

export class CreateCityDto {
    @IsNotEmpty()
    @IsString()
    name: string
}

export class CreateDistrictDto {
    @IsNotEmpty()
    @IsString()
    name: string
    
    @IsNotEmpty()
    @IsString()
    cityId: string
}