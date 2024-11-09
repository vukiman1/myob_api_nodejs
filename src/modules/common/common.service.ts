import { Body, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommonDto } from './dto/create-common.dto';
import { UpdateCommonDto } from './dto/update-common.dto';
import { CreateCityDto, CreateDistrictDto } from './dto/location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { City } from './entities/city.entity';
import { DataConfigs } from 'src/constants/data.constant';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(District)
    private districtRepository: Repository<District>,

    @InjectRepository(City)
    private cityRepository: Repository<City>,
) {}

  async create_district_service(createDistrictDto: CreateDistrictDto): Promise<any>{
    const { name, cityId } = createDistrictDto;
    // Tìm kiếm thành phố theo tên
    const city = await this.getCityById(+cityId);

    if (!city) {
        throw new NotFoundException(`City with id: "${cityId}" not found`);
    }

    const existingDistrict = await this.districtRepository.findOne({
      where: { name, city: { id: city.id } }, // Sử dụng city.id thay vì cả đối tượng city
    });
    if (existingDistrict) {
      throw new ConflictException(`District "${name}" already exists in city "${cityId}"`);
    }
    // Tạo mới District với thành phố đã tìm thấy
    const newDistrict = this.districtRepository.create({ name, city });
    const saveDistrict = await this.districtRepository.save(newDistrict);
    return saveDistrict
  }


  async create_city_service(createCityDto: CreateCityDto): Promise<CreateCityDto>{
    const city = await this.getCityByName(createCityDto.name);
    if (city) {
      throw new ForbiddenException(`City existing`);     
    }
    const newCity = this.cityRepository.create( {...createCityDto});
    const saveCity = await this.cityRepository.save(newCity);
    return saveCity
  }

  async getCityById(id: number): Promise<any> {
    const city = await this.cityRepository.findOne({ where: {id } });
    return city;
  }

  async getCityByName(name: string): Promise<any> {
    const city = await this.cityRepository.findOne({ where: {name } });
    return city;
  }
  
  async remove_district_service(id: number) {
    const district = await this.districtRepository.findOne({ where: { id } });
    if (!district) {
        throw new NotFoundException(`District with id ${id} not found`);
    }
    await this.districtRepository.delete(id);
    return `District with id ${id} has been deleted`;
  }


  async findAllDistrict(): Promise<any> {
    return this.districtRepository.find({});
  }

  async getDistrictsByCityService(cityId: number): Promise<any> {
    const districts = await this.districtRepository.find({
      where: { city: { id: cityId } },
      relations: ['city'],
    });

    if (!districts.length) {
      throw new NotFoundException(`No districts found for city with id ${cityId}`);
    }
    return districts.map(district => ({
      id: district.id,
      name: district.name,
    }));
  }


  async findAllCity(): Promise<any> {
    return this.cityRepository.find({});
  }

  async remove_city_service(id: number) {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
        throw new NotFoundException(`City with id ${id} not found`);
    }
    await this.cityRepository.delete(id);
    return `City has been deleted`;
}

  async getAllConfig( ) {

    const dataConfigList = [
      { key: 'GENDER', label: 'gender' },
      { key: 'MARITAL_STATUS', label: 'maritalStatus' },
      { key: 'LANGUAGE', label: 'language' },
      { key: 'LANGUAGE_LEVEL', label: 'languageLevel' },
      { key: 'POSITION', label: 'position' },
      { key: 'TYPE_OF_WORKPLACE', label: 'typeOfWorkplace' },
      { key: 'JOB_TYPE', label: 'jobType' },
      { key: 'EXPERIENCE', label: 'experience' },
      { key: 'ACADEMIC_LEVEL', label: 'academicLevel' },
      { key: 'EMPLOYEE_SIZE', label: 'employeeSize' },
      { key: 'APPLICATION_STATUS', label: 'applicationStatus' },
      { key: 'FREQUENCY_NOTIFICATION', label: 'frequencyNotification' },
      { key: 'JOB_POST_STATUS', label: 'jobPostStatus' }
    ];

    const configResult = {};

    // Tạo options và dict cho từng cấu hình
    dataConfigList.forEach(config => {
      const { options, dict } = this.createOptionsAndDict(DataConfigs[config.key]);
      configResult[`${config.label}Options`] = options;
      configResult[`${config.label}Dict`] = dict;
    });
  
    // Các cấu hình bổ sung
    configResult['cityOptions'] = [];
    configResult['careerOptions'] = [];
    configResult['cityDict'] = [];
    configResult['careerDict'] = [];
  
    return configResult;  // Trả về trực tiếp cấu hình
  }

  createOptionsAndDict = (array: { id: string | number, name: string }[]) => {
    const options = array; // Mảng các đối tượng { id, name }
    const dict = array.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {} as Record<string, string>); // Tạo dict với id là khóa và name là giá trị
    return { options, dict };
  };

}

