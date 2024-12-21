import {  IsNotEmpty,IsString } from "class-validator";

export class CreateCompanyImageDto {
    @IsNotEmpty()
    @IsString()
    imageUrl: string;
  }
