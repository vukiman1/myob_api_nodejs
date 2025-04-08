import { ArrayNotEmpty, IsArray, IsNumber } from "class-validator";

// DTO
export class UpdateStatusDto {
    @IsArray()
    @ArrayNotEmpty()
    ids: number[];
  }
  