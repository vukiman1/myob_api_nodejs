import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommonService } from './common.service';
import { CreateCityDto, CreateDistrictDto } from './dto/location.dto';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('district')
  async createDistrict( createDistrictDto: CreateDistrictDto) {
    const newDistrice = await this.commonService.create_district_service(createDistrictDto);
    return newDistrice
  }

  @Post('city')
  async createCity( createCityDto: CreateCityDto) {
    const newcity = await this.commonService.create_city_service(createCityDto);
    return newcity
  }

}
