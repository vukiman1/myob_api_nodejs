import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommonService } from './common.service';
import { CreateCityDto, CreateDistrictDto } from './dto/location.dto';
import { error } from 'console';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}


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

  @Delete('city/:id')
  async removeCity(@Param('id') id: string) {
    const remove = await this.commonService.remove_city_service(+id);
    return {
      errors: {},
      message: remove
    }
  }



}
