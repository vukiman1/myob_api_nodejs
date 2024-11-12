import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InfoService } from './info.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('info/web')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('company')
  async getInfoCompany(@Req() req: any) {
    const company = await this.infoService.getCompanyInfo(req.user.email)
    return company
  }



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInfoDto: UpdateInfoDto) {
    return this.infoService.update(+id, updateInfoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.infoService.remove(+id);
  }
}
