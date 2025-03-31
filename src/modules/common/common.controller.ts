import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { CommonService } from './common.service';
import { CreateCityDto, CreateDistrictDto, CreateLocationDto } from './dto/location.dto';
import { CreateCareerDto } from './dto/carrer.dto';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('configs')
  async getAllConfig() {
    const configs = await this.commonService.getAllConfig();
    return {
      errors: {},
      data: configs
    }
  }

  @Post('district')
  async createDistrict(@Body() createDistrictDto: CreateDistrictDto) {
    const newDistrice = await this.commonService.create_district_service(createDistrictDto);
    return newDistrice
  }

  @Delete('district/:id')
  async remove(@Param('id') id: string) {
    const remove = await this.commonService.remove_district_service(+id);
    return {
      errors: {},
      message: remove
    }
  }
  @Get('all-district')
  async findAllDistrict() {
    return this.commonService.findAllDistrict();
  }

  @Get('districts')
  async getDistrictsByCity(@Query('cityId') cityId: number) {
    const districts =  await this.commonService.getDistrictsByCityService(cityId);
    return {
      errors: {},
      data: districts
    }
  }


  @Get('city')
  async findAllCity() {
    return this.commonService.findAllCity();
  }

  @Post('city')
  async createCity(@Body() createCityDto: CreateCityDto) {
    const newcity = await this.commonService.create_city_service(createCityDto);
    return newcity
  }

  //Chỉ xoá khi chưa liên kết với bẳng nào, không nên xoá
  @Delete('city/:id')
  async removeCity(@Param('id') id: string) {
    const remove = await this.commonService.remove_city_service(+id);
    console.log(remove);
    return {
      remove
    }
  }

  @Patch('city/:id')
  async updateCity (@Param('id') id: string, @Body() createCityDto: CreateCityDto) {
    return this.commonService.updateCity(+id, createCityDto);
  }

  @Get('career')
  async findAllCareer() {
    return this.commonService.findAllCareer();
  }

  @Delete('career/:id')
  async removeCareer(@Param('id') id: string) {
    const remove = await this.commonService.removeCareer(id);
    return {
      errors: {},
      message: remove
    }
  }
  @Post('career')
  async createCarrer(@Body() createCareerDto: any) {
    const newCarrer = await this.commonService.create_career_service(createCareerDto);
    return newCarrer
  }
  @Patch('career/:id')
  async updateCareer(@Body() createCareerDto: any, @Param('id') id: string) {
    const newCarrer = await this.commonService.updateCareer(id, createCareerDto);
    return {
      errors: {},
      message: 'Career updated successfully',
      data: newCarrer
    }
  }

  @Post('career/file')
  async uploadCareerFile(@Body() file: Express.Multer.File) {
    console.log(file)
    // const imageUrl = await this.commonService.uploadCareerFile(file);
    return {
      errors: {},
      message: 'Career file uploaded successfully',
      imageUrl: 'imageUrl'
    }
  }

  @Get('location')
  async findAllLocation() {
    const location = await this.commonService.findAllLocation();
    return {
      errors: {},
      data: location
    }
  }

  @Post('location')
  async createLocation(@Body() createLocationDto: CreateLocationDto) {
    const newCarrer = await this.commonService.createLocation(createLocationDto);
    return newCarrer
  }


  @Get('top-careers')
  async getTopCareers() {
    const topCareers = await this.commonService.getTopCareers();
    return {
      errors: {},
      data: topCareers
    }
  }

}
