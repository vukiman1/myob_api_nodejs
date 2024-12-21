import { IsInt, Min, Max } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsInt()
  @Min(1) // Đảm bảo status không âm
  @Max(5) // Giới hạn giá trị status nếu cần (tùy thuộc vào yêu cầu nghiệp vụ)
  status: number;
}
