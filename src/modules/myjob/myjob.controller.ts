import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { CreateMyjobDto } from './dto/create-myjob.dto';
import { UpdateMyjobDto } from './dto/update-myjob.dto';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Controller('myjob')
export class MyjobController {
  constructor(private readonly myjobService: MyjobService) {}

  @Post('web/banner')
  createBanner(@Body() createBannerDto: CreateBannerDto) {
    return this.myjobService.createBanner(createBannerDto);
  }

  @Get('web/banner')
  async getBanner() {
    const banners = await this.myjobService.getAllBaner()
    return {
      errors: {},
      data: banners
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
