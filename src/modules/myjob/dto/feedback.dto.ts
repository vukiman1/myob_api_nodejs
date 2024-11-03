import { isBoolean, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
export class CreateFeedBackDto {


    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsNumber()
    rating: number
}


