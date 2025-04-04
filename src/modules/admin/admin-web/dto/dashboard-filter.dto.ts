import { IsOptional, IsString, IsDateString } from "class-validator"

export class DashboardFilterDto {
  @IsOptional()
  @IsString()
  industry?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string
}

