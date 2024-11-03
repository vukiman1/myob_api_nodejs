import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateFeedBackDto } from './dto/feedback.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('myjob')
export class MyjobController {
  constructor(private readonly myjobService: MyjobService) {}

  @Post('web/banner')
  createBanner(@Body() createBannerDto: CreateBannerDto) {
    return this.myjobService.createBanner(createBannerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('web/feedbacks')
  createFeedback(@Req() req: any, @Body() createFeedBackDto: CreateFeedBackDto) {
    return this.myjobService.createFeedback(createFeedBackDto, req.user.email);
  }

  @Get('web/banner')
  async getBanner() {
    const banner = await this.myjobService.getAllBaner()
    return {
      errors: {},
      data: banner
  }
  }



  @Patch('web/banner/:id')
  updateBanner(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.myjobService.updateBanner(id, updateBannerDto);
  }

  @Delete(':id')
  removeBanner(@Param('id') id: string) {
    return this.myjobService.removeBanner(id);
  }
}
