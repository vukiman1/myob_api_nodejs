import { Controller, Get, Body, Param, UseGuards, Req, Put, UseInterceptors, UploadedFile, Post } from '@nestjs/common';
import { InfoService } from './info.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyDto } from './dto/company.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('info/web')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('company')
  async getInfoCompany(@Req() req: any) {
    const company = await this.infoService.getCompanyInfo(req.user.email)
    return company
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('private-companies/company-cover-image-url')
  @UseInterceptors(FileInterceptor('file'))
  async updateCompanyCover(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<any> {
    const company = await this.infoService.updateCompanyCover(file,  req.user.id,  req.user.email,);
    return {
      errors: {},
      data: company
    }
    return "cover"
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('private-companies/company-image-url')
  @UseInterceptors(FileInterceptor('file'))
  async updateCompanyAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<any> {
    const company = await this.infoService.updateCompanyAvatar(file,  req.user.id,  req.user.email,);
    return {
      errors: {},
      data: company
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('private-companies/:id')
  async updateCompany(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.infoService.updateCompany(id, updateCompanyDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('company-images')
  @UseInterceptors(FileInterceptor('file'))
  async CreateCompanyImages(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<any> {
    const company = await this.infoService.createCompanyImages(file,  req.user.id,  req.user.email,);
    return {
      errors: {},
      data: company
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('company-images')
  async getCompanyImages(@Req() req: any) {
    const company = await this.infoService.getCompanyImages(req.user.email)
    return company
  }

}
