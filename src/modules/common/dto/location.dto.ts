import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
    @IsNumber()
    city: number
}

export class CreateLocationDto {
    @IsNotEmpty()
    @IsString()
    address: string
    
    @IsNotEmpty()
    @IsNumber()
    city: number


    @IsNotEmpty()
    @IsNumber()
    district: number
}

export class CreateJobLocationDto {
    @IsNotEmpty()
    @IsString()
    address: string
    
    @IsNotEmpty()
    @IsNumber()
    city: number


    @IsNotEmpty()
    @IsNumber()
    district: number

    @IsNumber()
    lat: number
    @IsNumber()
    lng: number
}

export class LocationDto {
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