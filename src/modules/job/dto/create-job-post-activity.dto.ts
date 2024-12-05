import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import moment from 'moment';

export class CreateJobPostActivityDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsNumber()
  job_post: number;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  resume: string;
}


export class JobActivityResponseDto {
  static toResponse(activity: any) {
    const jobPost = activity.jobPost;
    const company = jobPost.company;

    return {
      id: activity.id,
      createAt: moment(activity.createAt).format('YYYY-MM-DDTHH:mm:ssZ'),
      jobPostDict: {
        id: jobPost.id,
        slug: jobPost.slug,
        jobName: jobPost.jobName,
        deadline: moment(jobPost.deadline).format('YYYY-MM-DD'),
        salaryMin: jobPost.salaryMin,
        salaryMax: jobPost.salaryMax,
        isHot: jobPost.isHot,
        isUrgent: jobPost.isUrgent,
        companyDict: {
          id: company.id,
          slug: company.slug,
          companyName: company.companyName,
          employeeSize: company.employeeSize,
          companyImageUrl: company.companyImageUrl,
          mobileUserDict: activity.user
            ? {
                id: activity.user.id,
                fullName: activity.user.fullName,
                email: activity.user.email,
              }
            : null,
        },
        locationDict: {
          city: jobPost.location?.city,
        },
      },
      resumeDict: {
        id: activity.resume?.id,
        slug: activity.resume?.slug,
        title: activity.resume?.title,
        type: activity.resume?.type,
      },
    };
  }
}


export class JobPostActivityResponseDto {
  static toResponse(activity: any) {
    return {
      id: activity.id,
      fullName: activity.fullName,
      email: activity.email,
      title: activity.resume?.title || null, // Lấy từ Resume
      type: activity.resume?.type || 'UNKNOWN', // Loại CV
      resumeSlug: activity.resume?.slug || null,
      jobName: activity.jobPost?.jobName || null,
      status: activity.status,
      createAt: activity.createAt,
      isSentEmail: activity.isSendMail || false,
    };
  }
}