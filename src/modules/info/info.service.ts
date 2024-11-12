import { ConflictException, Injectable } from '@nestjs/common';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../common/entities/location.entity';
import { ErrorEnum } from 'src/constants/error-code.constant';
import moment from 'moment';
import { CompanyResponseDto } from './dto/company.dto';

@Injectable()
export class InfoService {
  constructor(
    @InjectRepository(Location)
      private locationRepository: Repository<Location>,
    @InjectRepository(Company)
      private companyRepository: Repository<Company>,
    @InjectRepository(User)
      private userRepository: Repository<User>,
) {}

  get_user_info_services(createInfoDto: CreateInfoDto) {
    return 'This action adds a new info';
  }

  async getCompanyInfo(email: string) {
    const company = await this.findCompanyByEmail(email);
    return {
      errors: {},
      data:  CompanyResponseDto.toResponse(company)
    }
  }

  async findCompanyByEmail(email: string): Promise<any> {
    const company = await this.companyRepository.findOne({
      where: { user: { email } },
      relations: ['user', 'location', 'location.city', 'location.district'],
    });

    if (!company) {
      throw new ConflictException('User dont have company');
    }
    return company
  }


  findOne(id: number) {
    return `This action returns a #${id} info`;
  }

  update(id: number, updateInfoDto: UpdateInfoDto) {
    return `This action updates a #${id} info`;
  }

  remove(id: number) {
    return `This action removes a #${id} info`;
  }

  // find company by user email


  async findUserByEmail(email:string):Promise<User> {
    const user =  this.userRepository.findOne({ where: { email } });
    return user
  }


}
