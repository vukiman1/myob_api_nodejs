import { Controller, Get, Body, Param, UseGuards, Req, Put, UseInterceptors, UploadedFile, Post, Delete, Res, Query } from '@nestjs/common';
import { InfoService } from './info.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyDto } from './dto/company.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';

@Controller('info/web')
export class InfoController {
  constructor(private readonly infoService: InfoService,
  ) {}


  @UseGuards(AuthGuard('jwt'))
  @Get('company')
  async getInfoCompany(@Req() req: any) {
    const company = await this.infoService.getCompanyInfo(req.user.email)
    return {
      errors: {},
      data: company
    }
  }

  @Get('companies/top')
  async getInfoCompanyTop() {
    const topCompany = await this.infoService.getCompanyTop()
    return {
      errors: {},
      data: topCompany
    }
  }

  @Get('companies/:slug')
    async getPublicCompany(
        @Param('slug') slug: string,
        @Req() req: any
    ) {
        const result = await this.infoService.getPublicCompany(slug, req.headers);
        return {
          errors: {},
          data: result,
        }

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
  @UseInterceptors(FileInterceptor('files'))
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
    return {
      errors: {},
      data: company
    }
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('company-images/:imageId')
  async deleteCompanyImage(
    @Param('imageId') imageId: number,
  ): Promise<any> {
    await this.infoService.deleteCompanyImage(imageId);
    return {
      errors: {},
      message: 'Hình ảnh đã được xóa thành công.',
    };
  }

  
  @UseGuards(AuthGuard('jwt'))
  @Post('companies/:slug/followed/')
    async followCompany(
        @Param('slug') slug: string,
        @Req() req: any
    ) {
        const result = await this.infoService.followCompany(slug, req.user.id);
        return {
          errors: {},
          data: result,
        }

    }

    @Get('companies')
    async findAllCompanies(
      @Req() req: any,
      @Query('cityId') cityId: number,
      @Query('kw') keyword: string = "",
      @Query('page') page: number = 1,
      @Query('pageSize') pageSize:number = 5,
    ) {
      const jobPosts = await this.infoService.findAllCompanies({
        cityId,
        keyword,       
        page, 
        pageSize,

      },req.headers);
    
      return {
        errors: {},
        data: {
          count: jobPosts.count,
          results: jobPosts.results,
        },
      };
    }

}
