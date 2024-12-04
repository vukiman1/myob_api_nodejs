import { IsInt, IsString, IsBoolean } from 'class-validator';
import { JobPostNotification } from '../entities/job-post-notification.entity';

export class CreateJobPostNotificationDto {
  @IsString()
  jobName: string;

  @IsInt()
  position: number;

  @IsString()
  experience: string;

  @IsInt()
  salary: number;

  @IsInt()
  frequency: number;

  @IsInt()
  career: number;

  @IsInt()
  city: number;
}

export class JobPostNotificationResponseDto {
    static toResponse(notification: JobPostNotification) {
      return {
        id: notification.id,
        jobName: notification.jobName,
        salary: notification.salary,
        frequency: notification.frequency,
        isActive: notification.isActive,
        career: notification.career?.id,
        city: notification.city?.id,
      };
    }
  }