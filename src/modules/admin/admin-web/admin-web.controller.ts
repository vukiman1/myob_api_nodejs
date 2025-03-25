import { Controller } from '@nestjs/common';
import { AdminWebService } from './admin-web.service';

@Controller('admin-web')
export class AdminWebController {
  constructor(private readonly adminWebService: AdminWebService) {}
}
