import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { CreateBannerDto, CreateBannerDto2, UpdateBannerDto } from './dto/banner.dto';
import { CreateFeedBackDto } from './dto/feedback.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateFeedbackDto } from './dto/updateFeedback.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { TypeEnums } from './entities/notifications.entity';

@Controller('myjob')
export class MyjobController {
  constructor(private readonly myjobService: MyjobService) {}

  @Post('admin/banner')
  async createBanner(@Body() createBannerDto: CreateBannerDto2) {
    await this.myjobService.createNotification(
      {
        title: `Cập nhật banner mới`,
        message: `Admin vừa cập nhật banner mới`,
        imageUrl: createBannerDto.imageUrl,
        type: TypeEnums.success,
      }
    )
    return this.myjobService.createBanner(createBannerDto);
  }

  @Put('admin/banner/:id')
  uploadBanner(@Body() bannerDto: any, @Param('id') id: string) {

    return this.myjobService.uploadBanner(bannerDto, id);
  }

  @Delete('admin/banner/:id')
  deleteBanner( @Param('id') id: string) {
    return this.myjobService.deleteBanner(id);
  }


  @Post('web/banner2')
  @UseInterceptors(FileInterceptor('file'))
  createBanner2( @UploadedFile() file: Express.Multer.File) {
    return file
  }



  @Get('web/banner')
  async getBanner() {
    const banner = await this.myjobService.getAllBaner()
    return {
      errors: {},
      data: banner
    }
  }

  @Get('web/popup')
  async getPopups() {
    const popups = await this.myjobService.getPopups()
    return {
      errors: {},
      data: popups
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

  @Post('admin/banner/file')
  @UseInterceptors(FileInterceptor('file'))
  async uloadBanner(@UploadedFile() file: Express.Multer.File,) {
    const banner = await this.myjobService.uloadBanner(file)
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
  @Post('web/banner/user')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBannerUser(@Body() link: any, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const imageUrl = await this.myjobService.uploadBannerUser(file, req.user.id, link.link);
    return {
      errors: {},
      data: imageUrl
    }
  }




  @UseGuards(AuthGuard('jwt'))
  @Post('web/feedbacks')
  async createFeedback(@Req() req: any, @Body() createFeedBackDto: CreateFeedBackDto) {
    const feedback = await this.myjobService.createFeedback(createFeedBackDto, req.user.email);
    await this.myjobService.createNotification(
      {
        title: `Feedback mới`,
        message: `Người dùng ${feedback.user.fullName} vừa gửi phản hồi về trải nghiệm sử dụng`,
        imageUrl: feedback.user.avatarUrl,
        type: TypeEnums.info,
      }
    )
    return feedback
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

  @Post('web/notification')
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.myjobService.createNotification(createNotificationDto)
    return {
      errors: {},
      message: 'Notification created successfully',
      notification
    }
  }

  @Get('web/notification')
  async getAllNotification() {
    const notification = await this.myjobService.getAllNotification()
    return {
      errors: {},
      data: notification
    }
  }

  @Get('web/notification/new')
  async getNewNotification() {
    const notification = await this.myjobService.getNewNotification()
    return {
      errors: {},
      data: notification
    }
  }

  @Patch('web/notification/read/:id')
  async markIsReadNoti(@Param('id') id: string) {
    const notification = await this.myjobService.markIsReadNoti(id)
  }

}
