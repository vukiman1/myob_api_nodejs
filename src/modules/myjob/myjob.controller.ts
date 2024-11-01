import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MyjobService } from './myjob.service';
import { CreateMyjobDto } from './dto/create-myjob.dto';
import { UpdateMyjobDto } from './dto/update-myjob.dto';

@Controller('myjob')
export class MyjobController {
  constructor(private readonly myjobService: MyjobService) {}

  @Post()
  create(@Body() createMyjobDto: CreateMyjobDto) {
    return this.myjobService.create(createMyjobDto);
  }

  @Get()
  findAll() {
    return this.myjobService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.myjobService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMyjobDto: UpdateMyjobDto) {
    return this.myjobService.update(+id, updateMyjobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.myjobService.remove(+id);
  }
}
