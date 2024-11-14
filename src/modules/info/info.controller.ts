import { Controller, Get, Body, Param, UseGuards, Req, Put } from '@nestjs/common';
import { InfoService } from './info.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCompanyDto } from './dto/company.dto';

@Controller('info/web')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('company')
  async getInfoCompany(@Req() req: any) {
    const company = await this.infoService.getCompanyInfo(req.user.email)
    return company
  }

  @Put('private-companies/:id')
  async updateCompany(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.infoService.updateCompany(id, updateCompanyDto);
  }



}
