import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  UseInterceptors,
  UploadedFile,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { InfoService } from './info.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyDto } from './dto/company.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExperiencesDetail } from './entities/experiences-detail.entity';

@Controller('info/web')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('job-seeker-profiles/:id/resumes')
  async getJobSeekerResumes(
    @Param('id') id: string,
    @Query('resumeType') resumeType: string,
  ) {
    const resumes = await this.infoService.getJobSeekerResumes(+id, resumeType);
    return {
      errors: {},
      data: resumes,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private-resumes/:slug/resume-owner')
  async getJobSeekerResumesOwner(@Param('slug') slug: string) {
    const resumeOwner = await this.infoService.getJobSeekerResumesOwner(slug);
    return {
      errors: {},
      data: resumeOwner,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('private-resumes/:slug/experiences-detail')
  async getExperiencesDetail(@Param('slug') slug: string) {
    const experient = await this.infoService.getExperiencesDetail(slug);
    return {
      errors: {},
      data: experient,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('experiences-detail')
  async createExperiencesDetail( @Req() req: any, @Body() experiencesDetail: any) {
    console.log('ok');
    const experient = await this.infoService.createExperiencesDetail(experiencesDetail, req.user.id);
    return {
      errors: {},
      data: experient,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('private-resumes/:slug/educations-detail')
  async getEducationsDetail(@Param('slug') slug: string) {
    const eduationDetail = await this.infoService.getEducationsDetail(slug);
    return {
      errors: {},
      data: eduationDetail,
    };
  }



  @UseGuards(AuthGuard('jwt'))
  @Get('private-resumes/:slug/certificates-detail')
  async getCertificatesDetail(@Param('slug') slug: string) {
    const cetificatesDetail = await this.infoService.getCertificatesDetail(slug);
    return {
      errors: {},
      data: cetificatesDetail,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private-resumes/:slug/language-skills')
  async getLanguageSkills(@Param('slug') slug: string) {
    const languageSkills = await this.infoService.getLanguageSkills(slug);
    return {
      errors: {},
      data: languageSkills,
    };
  }
  

  @UseGuards(AuthGuard('jwt'))
  @Get('private-resumes/:slug/advanced-skills')
  async getAdvancedSkills(@Param('slug') slug: string) {
    const advancedSkills = await this.infoService.getAdvancedSkills(slug);
    return {
      errors: {},
      data: advancedSkills,
    };
  }

  
  @UseGuards(AuthGuard('jwt'))
  @Post('educations-detail')
  async createEducationsDetail( @Req() req: any, @Body() educationsDetail: any) {
    const data = await this.infoService.createEducationsDetail(educationsDetail, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }


  
  @UseGuards(AuthGuard('jwt'))
  @Post('certificates-detail')
  async createCertificatesDetail( @Req() req: any, @Body() certificatesDetail: any) {
    const data = await this.infoService.createCertificatesDetail(certificatesDetail, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }


  
  @UseGuards(AuthGuard('jwt'))
  @Post('language-skills')
  async createLanguageSkills( @Req() req: any, @Body() languageSkills: any) {
    const data = await this.infoService.createLanguageSkills(languageSkills, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }

  
  @UseGuards(AuthGuard('jwt'))
  @Post('advanced-skills')
  async createAdvancedSkills( @Req() req: any, @Body() advancedSkills: any) {
    const data = await this.infoService.createAdvancedSkills(advancedSkills, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }
  

  @UseGuards(AuthGuard('jwt'))
  @Get('company')
  async getInfoCompany(@Req() req: any) {
    const company = await this.infoService.getCompanyInfo(req.user.email);
    return {
      errors: {},
      data: company,
    };
  }

  @Get('companies/top')
  async getInfoCompanyTop() {
    const topCompany = await this.infoService.getCompanyTop();
    return {
      errors: {},
      data: topCompany,
    };
  }

  @Get('companies/:slug')
  async getPublicCompany(@Param('slug') slug: string, @Req() req: any) {
    const result = await this.infoService.getPublicCompany(slug, req.headers);
    return {
      errors: {},
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('private-companies/company-cover-image-url')
  @UseInterceptors(FileInterceptor('file'))
  async updateCompanyCover(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const company = await this.infoService.updateCompanyCover(
      file,
      req.user.id,
      req.user.email,
    );
    return {
      errors: {},
      data: company,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('private-companies/company-image-url')
  @UseInterceptors(FileInterceptor('file'))
  async updateCompanyAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const company = await this.infoService.updateCompanyAvatar(
      file,
      req.user.id,
      req.user.email,
    );
    return {
      errors: {},
      data: company,
    };
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
  async CreateCompanyImages(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const company = await this.infoService.createCompanyImages(
      file,
      req.user.id,
      req.user.email,
    );
    return {
      errors: {},
      data: company,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('company-images')
  async getCompanyImages(@Req() req: any) {
    const company = await this.infoService.getCompanyImages(req.user.email);
    return {
      errors: {},
      data: company,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('company-images/:imageId')
  async deleteCompanyImage(@Param('imageId') imageId: number): Promise<any> {
    await this.infoService.deleteCompanyImage(imageId);
    return {
      errors: {},
      message: 'Hình ảnh đã được xóa thành công.',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('companies/:slug/followed/')
  async followCompany(@Param('slug') slug: string, @Req() req: any) {
    const result = await this.infoService.followCompany(slug, req.user.id);
    return {
      errors: {},
      data: result,
    };
  }

  @Get('companies')
  async findAllCompanies(
    @Req() req: any,
    @Query('cityId') cityId: number,
    @Query('kw') keyword: string = '',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 5,
  ) {
    const jobPosts = await this.infoService.findAllCompanies(
      {
        cityId,
        keyword,
        page,
        pageSize,
      },
      req.headers,
    );

    return {
      errors: {},
      data: {
        count: jobPosts.count,
        results: jobPosts.results,
      },
    };
  }
}

@Controller('info')
export class InfoController2 {
  constructor(private readonly infoService: InfoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getJobSeekerProfile(@Req() req: any) {
    const profile = await this.infoService.getJobSeekerProfile(req.user.email);
    return {
      errors: {},
      data: profile,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  async updateJobSeekerProfile(@Req() req: any, @Body() updateProfileDto: any) {
    const profile = await this.infoService.updateJobSeekerProfile(
      req.user.email,
      updateProfileDto,
    );
    return {
      errors: {},
      data: profile,
    };
  }
}
