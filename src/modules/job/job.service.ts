import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  create(createJobDto: CreateJobDto) {
    return 'This action adds a new job';
  }

  async createPrivateJobPost() {
    return"ok";
  }
}
