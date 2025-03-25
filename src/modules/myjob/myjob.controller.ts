import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateFeedBackDto } from './dto/feedback.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateFeedbackDto } from './dto/updateFeedback.dto';

@Controller('myjob')
export class MyjobController {
  constructor(private readonly myjobService: MyjobService) {}

  @Post('web/banner')
  createBanner(@Body() createBannerDto: CreateBannerDto) {
    return this.myjobService.createBanner(createBannerDto);
  }


  @Get('web/banner')
  async getBanner() {
    const banner = await this.myjobService.getAllBaner()
    return {
      errors: {},
      data: banner
    }
  }


  @Get('admin/banner')
  async adminGetAllBanner() {
    const banner = await this.myjobService.adminGetAllBanner()
    return {
      errors: {},
      data: banner
    }
  }

  @Patch('web/banner/:id')
  updateBanner(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.myjobService.updateBanner(id, updateBannerDto);
  }

  @Delete('web/banner/:id')
  removeBanner(@Param('id') id: string) {
    return this.myjobService.removeBanner(id);
  }




  @UseGuards(AuthGuard('jwt'))
  @Post('web/feedbacks')
  createFeedback(@Req() req: any, @Body() createFeedBackDto: CreateFeedBackDto) {
    return this.myjobService.createFeedback(createFeedBackDto, req.user.email);
  }

  @Post('web/feedbacks/status/:id')
  changeFeedbackStatus(@Param('id') id: string) {
    return this.myjobService.changeFeedbackStatus(id);
  }

  @Post('web/feedbacks/update/:id')
  updateFeedback(@Param('id') id: string, @Body() updateFeedBackDto: UpdateFeedbackDto) {
    return this.myjobService.updateFeedback(id, updateFeedBackDto);
  }

  @Post('web/banner/status/:id')
  changeBannerStatus(@Param('id') id: string) {
    return this.myjobService.changeBannerStatus(id);
  }

  @Get('web/feedbacks')
  async getFeedbacks() {
    const feedback = await this.myjobService.getFeedbacks()
    return {
      errors: {},
      data: feedback
  }
  }

  @Get('web/all-feedbacks')
  async getAllFeedbacks() {
    const feedback = await this.myjobService.getAllFeedbacks()
    return {
      errors: {},
      data: feedback
  }
  }
}
