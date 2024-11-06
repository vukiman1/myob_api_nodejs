import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommonDto } from './dto/create-common.dto';
import { UpdateCommonDto } from './dto/update-common.dto';
import { CreateCityDto, CreateDistrictDto } from './dto/location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { City } from './entities/city.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(District)
    private districtRepository: Repository<District>,

    @InjectRepository(City)
    private cityRepository: Repository<City>,
) {}

  async create_district_service(createDistrictDto: CreateDistrictDto): Promise<void>{
    const { name, cityName } = createDistrictDto;
    // Tìm kiếm thành phố theo tên
    const city = await this.cityRepository.findOne({ where: { name: cityName } });
    if (!city) {
        throw new NotFoundException(`City with name ${cityName} not found`);
    }
    // Tạo mới District với thành phố đã tìm thấy
    const district = this.districtRepository.create({ name, city });
    this.districtRepository.save(district);
  }


  async create_city_service(createCityDto: CreateCityDto): Promise<CreateCityDto>{
    // Tạo mới District
    const city = this.districtRepository.create( {...createCityDto});
    // Thêm District vào database
    const newcity = await this.districtRepository.save(city);
    return newcity
  }
}
