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
import { CreateResumeDto } from './dto/create-resume.dto';

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
  @Get('private-resumes/:slug/resume-active')
  async toggleActiveResume(@Param('slug') slug: string) {
    const result = await this.infoService.toggleResumeActive(slug);
    return {
      errors: {},
      data: result,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Put('private-resumes/:slug')
  async updatePrivateResume(@Param('slug') slug: string, @Body() updateResumeDto: any) {
    const updatedResume = await this.infoService.updatePrivateResume(slug, updateResumeDto);
    return {
      errors: {},
      data: updatedResume,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('private-resumes')
  @UseInterceptors(FileInterceptor('file'))
  async createPrivateResume(
    @Req() req: any,
    @Body() createResumeDto: CreateResumeDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const createdResume = await this.infoService.createPrivateResume(createResumeDto, file, req.user.id);
    return {
      errors: {},
      data: createdResume,
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
  @Get('private-resumes/:slug/cv')
  async getJobSeekerCV(@Param('slug') slug: string) {
    const data = await this.infoService.getJobSeekerCV(slug);
    return {
      errors: {},
      data: data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('resumes/:slug')
  async getResumeDetails(@Param('slug') slug: string, @Req() req:any) {
    const data = await this.infoService.getResumeDetails(slug, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }




  //experience details
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
    const experient = await this.infoService.createExperiencesDetail(experiencesDetail, req.user.id);
    return {
      errors: {},
      data: experient,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('experiences-detail/:id')
  async getExperiencesDetailById(@Param('id') id: string) {
    const data = await this.infoService.getExperiencesDetailById(id);
    return {
      errors: {},
      data: data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('experiences-detail/:id')
  async updateExperiencesDetailById(@Param('id') id: string, @Body() updateData: any) {
    const updatedEducationDetail = await this.infoService.updateExperiencesDetailById(id, updateData);
    return {
      errors: {},
      data: updatedEducationDetail,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('experiences-detail/:id')
  async deleteExperiencesDetailById(@Param('id') id: string) {
    await this.infoService.deleteExperiencesDetailById(id);
    return {
      errors: {},
      message: 'Education detail deleted successfully',
    };
  }






  //education deatals

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
  @Post('educations-detail')
  async createEducationsDetail( @Req() req: any, @Body() educationsDetail: any) {
    const data = await this.infoService.createEducationsDetail(educationsDetail, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }



  @UseGuards(AuthGuard('jwt'))
  @Get('educations-detail/:id')
  async getEducationDetailById(@Param('id') id: string) {
    const educationDetail = await this.infoService.getEducationDetailById(id);
    return {
      errors: {},
      data: educationDetail,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('educations-detail/:id')
  async updateEducationDetailById(@Param('id') id: string, @Body() updateData: any) {
    const updatedEducationDetail = await this.infoService.updateEducationDetailById(id, updateData);
    return {
      errors: {},
      data: updatedEducationDetail,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('educations-detail/:id')
  async deleteEducationDetailById(@Param('id') id: string) {
    await this.infoService.deleteEducationDetailById(id);
    return {
      errors: {},
      message: 'Education detail deleted successfully',
    };
  }




// certificate details
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
  @Post('certificates-detail')
  async createCertificatesDetail( @Req() req: any, @Body() certificatesDetail: any) {
    const data = await this.infoService.createCertificatesDetail(certificatesDetail, req.user.id);
    return {
      errors: {},
      data: data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('certificates-detail/:id')
  async getCertificatesDetailById(@Param('id') id: string) {
    const data = await this.infoService.getCertificatesDetailById(id);
    return {
      errors: {},
      data: data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('certificates-detail/:id')
  async updateCertificatesDetailById(@Param('id') id: string, @Body() updateData: any) {
    const data = await this.infoService.updateCertificatesDetailById(id, updateData);
    return {
      errors: {},
      data: data,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('certificates-detail/:id')
  async deleteCertificatesDetailById(@Param('id') id: string) {
    await this.infoService.deleteCertificatesDetailById(id);
    return {
      errors: {},
      message: 'Certificates Detail deleted successfully',
    };
  }





//language skills
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
  @Get('language-skills/:id')
  async getLanguageSkillsById(@Param('id') id: string) {
    const data = await this.infoService.getLanguageSkillsById(id);
    return {
      errors: {},
      data: data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('language-skills/:id')
  async updateLanguageSkillsById(@Param('id') id: string, @Body() updateData: any) {
    const data = await this.infoService.updateLanguageSkillsById(id, updateData);
    return {
      errors: {},
      data: data,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('language-skills/:id')
  async deleteLanguageSkillsById(@Param('id') id: string) {
    await this.infoService.deleteLanguageSkillsById(id);
    return {
      errors: {},
      message: 'LanguageSkill deleted successfully',
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
  @Get('advanced-skills/:id')
  async getAdvancedSkillsById(@Param('id') id: string) {
    const data = await this.infoService.getAdvancedSkillsById(id);
    return {
      errors: {},
      data: data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('advanced-skills/:id')
  async updateAdvancedSkillssById(@Param('id') id: string, @Body() updateData: any) {
    const data = await this.infoService.updateAdvancedSkillsById(id, updateData);
    return {
      errors: {},
      data: data,
    };
  }


  @UseGuards(AuthGuard('jwt'))
  @Delete('advanced-skills/:id')
  async deleteAdvancedSkillsById(@Param('id') id: string) {
    await this.infoService.deleteAdvancedSkillsById(id);
    return {
      errors: {},
      message: 'AdvancedSkills deleted successfully',
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

  @UseGuards(AuthGuard('jwt'))
  @Get('companies-follow')
  async getFollowedCompanies(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() req: any
  ) {
    const result = await this.infoService.getFollowedCompanies(req.user.id, page, pageSize);
    return {
      errors: {},
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resumes/:slug/resume-saved/')
  async toggleResumeSavedBySlug(
    @Param('slug') slug: string, // Lấy slug từ URL
    @Req() req: any // Lấy thông tin user từ JWT
  ) {
    const isSaved = await this.infoService.toggleResumeSavedBySlug(slug, req.user.id);
    return {
      errors: {},
      data: { isSaved },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/resume-views/')
  async getResumeViews(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<any> {
    return this.infoService.getResumeViews(page, pageSize, req.user.id);
  }


  @UseGuards(AuthGuard('jwt'))
  @Post('resumes/:slug/view-resume')
  async CreateViewResume(
    @Param('slug') slug: string, // Lấy slug từ URL
  ) {
    
    return {
      errors: {},
      data: null,
      log: "Hàm này mới chỉ để chống, chưa biết làm gì, hehe"
    };
  }

  @UseGuards(AuthGuard('jwt'))
@Get('resumes-saved/')
async getSavedResumes(
  @Req() req: any,
  @Query('cityId') cityId?: number,
  @Query('experienceId') experienceId?: number,
  @Query('kw') keyword?: string,
  @Query('page') page: number = 1,
  @Query('pageSize') pageSize: number = 10,
  @Query('salaryMax') salaryMax?: number
) {
  const result = await this.infoService.getSavedResumes(
    req.user.id,
    cityId,
    experienceId,
    keyword,
    page,
    pageSize,
    salaryMax
  );

  return {
    errors: {},
    data: result,
  };
  }

  @UseGuards(AuthGuard('jwt'))
@Get('resumes-saved/export/')
async exportSavedResumes(
  @Req() req: any,
  @Query('cityId') cityId?: number,
  @Query('experienceId') experienceId?: number,
  @Query('kw') keyword?: string,
  @Query('page') page: number = 1,
  @Query('pageSize') pageSize: number = 10,
  @Query('salaryMax') salaryMax?: number,
) {
  const data = await this.infoService.exportSavedResumes(
    req.user.id,
    cityId,
    experienceId,
    keyword,
    page,
    pageSize,
    salaryMax
  );

  return {
    errors: {},
    data,
  };
}

@UseGuards(AuthGuard('jwt'))
@Get('resumes')
async getResumes(
  @Req() req:any,
  @Query('academicLevelId') academicLevelId: string,
  @Query('careerId') careerId: string,
  @Query('cityId') cityId: string,
  @Query('experienceId') experienceId: string,
  @Query('genderId') genderId: string,
  @Query('jobTypeId') jobTypeId: string,
  @Query('kw') kw: string,
  @Query('maritalStatusId') maritalStatusId: string,
  @Query('page') page: number,
  @Query('pageSize') pageSize: number,
  @Query('positionId') positionId: string,
  @Query('typeOfWorkplaceId') typeOfWorkplaceId: string,
) {
  const resumes = await this.infoService.getResumes({
    academicLevelId,
    careerId,
    cityId,
    experienceId,
    genderId,
    jobTypeId,
    kw,
    maritalStatusId,
    page: +page,
    pageSize: +pageSize,
    positionId,
    typeOfWorkplaceId,
  },
  req.user.id
);
  return {
    errors: {},
    data: resumes,
  };
}


@Get('resumes-all')
async getResumesAdmin(
  @Req() req:any,
  @Query('academicLevelId') academicLevelId: string,
  @Query('careerId') careerId: string,
  @Query('cityId') cityId: string,
  @Query('experienceId') experienceId: string,
  @Query('genderId') genderId: string,
  @Query('jobTypeId') jobTypeId: string,
  @Query('kw') kw: string,
  @Query('maritalStatusId') maritalStatusId: string,
  @Query('page') page: number,
  @Query('pageSize') pageSize: number,
  @Query('positionId') positionId: string,
  @Query('typeOfWorkplaceId') typeOfWorkplaceId: string,
) {
  const resumes = await this.infoService.getResumesAdmin({
    academicLevelId,
    careerId,
    cityId,
    experienceId,
    genderId,
    jobTypeId,
    kw,
    maritalStatusId,
    page: +page,
    pageSize: +pageSize,
    positionId,
    typeOfWorkplaceId,
  }
);
  return {
    errors: {},
    data: resumes,
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

  @Get('admin/getAllCompany')
  async getAllCompany() {
    return await this.infoService.getAllCompany();
  }


}
