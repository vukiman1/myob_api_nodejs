import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 5;
}