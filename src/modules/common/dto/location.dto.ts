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

export class CreateLocationDto {
    @IsNotEmpty()
    @IsString()
    address: string
    

    @IsString()
    lat: string

    @IsString()
    lng: string

    @IsNotEmpty()
    @IsString()
    cityId: string

    @IsNotEmpty()
    @IsString()
    districtId: string
}