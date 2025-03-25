import { Controller } from '@nestjs/common';
import { AdminJobPostService } from './admin-job-post.service';

@Controller('admin-job-post')
export class AdminJobPostController {
  constructor(private readonly adminJobPostService: AdminJobPostService) {}
}
