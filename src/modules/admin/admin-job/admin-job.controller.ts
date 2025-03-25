import { Controller } from '@nestjs/common';
import { AdminJobService } from './admin-job.service';

@Controller('admin-job')
export class AdminJobController {
  constructor(private readonly adminJobService: AdminJobService) {}
}
