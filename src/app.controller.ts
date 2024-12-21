import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiProperty } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Get()
  @ApiProperty({
    description: `A list of user's roles`,
    example: ['admin'],
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
