import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Việc làm 365 api connect successfull!';
  }
}
