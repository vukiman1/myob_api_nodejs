import { Injectable } from '@nestjs/common';
import { CreateMyjobDto } from './dto/create-myjob.dto';
import { UpdateMyjobDto } from './dto/update-myjob.dto';

@Injectable()
export class MyjobService {
  create(createMyjobDto: CreateMyjobDto) {
    return 'This action adds a new myjob';
  }

  findAll() {
    return `This action returns all myjob`;
  }

  findOne(id: number) {
    return `This action returns a #${id} myjob`;
  }

  update(id: number, updateMyjobDto: UpdateMyjobDto) {
    return `This action updates a #${id} myjob`;
  }

  remove(id: number) {
    return `This action removes a #${id} myjob`;
  }
}
