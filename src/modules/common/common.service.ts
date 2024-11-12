import { Body, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto, CreateDistrictDto, CreateLocationDto } from './dto/location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { City } from './entities/city.entity';
import { DataConfigs } from 'src/constants/data.constant';
import { Career } from './entities/carrer.entity';
import { CreateCareerDto } from './dto/carrer.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(District)
    private districtRepository: Repository<District>,

    @InjectRepository(City)
    private cityRepository: Repository<City>,

    @InjectRepository(Career)
    private carrerRepository: Repository<Career>,

    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
) {}

  async create_district_service(createDistrictDto: CreateDistrictDto): Promise<any>{
    const { name, city } = createDistrictDto;
    // Tìm kiếm thành phố theo tên
    const oldcity = await this.getCityById(+city);

    if (!oldcity) {
        throw new NotFoundException(`City with id: "${city}" not found`);
    }
    const existingDistrict = await this.districtRepository.findOne({
      where: { name, city: { id: oldcity.id } }, // Sử dụng city.id thay vì cả đối tượng city
    });
    if (existingDistrict) {
      throw new ConflictException(`District "${name}" already exists in city "${city}"`);
    }
    // Tạo mới District với thành phố đã tìm thấy
    const newDistrict = this.districtRepository.create({ name, city:oldcity});
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


async createLocation(createLocationDto: CreateLocationDto) {
  const location = await this.getLocationByName(createLocationDto.address);
  if (location) {
    throw new ForbiddenException(`Location existing`);
  }

  const city = await this.getCityById(+createLocationDto.city);
  if (!city) {
    throw new NotFoundException(`City with id: "${createLocationDto.city}" not found`);
  }

  const district = await this.districtRepository.findOne({ where: { id: +createLocationDto.district, city: { id: city.id } } });
  if (!district) {
    throw new NotFoundException(`District with id: "${createLocationDto.district}" not found in city "${createLocationDto.city}"`);
  }

  const newLocation = this.locationRepository.create({
    ...createLocationDto,
    city,
    district,
  });

  const saveLocation = await this.locationRepository.save(newLocation);
  return saveLocation;
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

  async updateCity(id: number,createCityDto): Promise<any> {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
        throw new NotFoundException(`City with id ${id} not found`);
    }
    await this.cityRepository.update(id, { name: createCityDto.name });
    // Trả về city sau khi cập nhật
    return this.cityRepository.findOne({ where: { id } });
  }


async getAllConfig() {
  const cities = await this.findAllCity();
  const careers = await this.findAllCareer();

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

  // Tạo options và dict cho từng cấu hình trong dataConfigList
  dataConfigList.forEach(config => {
    const { options, dict } = this.createOptionsAndDict(DataConfigs[config.key]);
    configResult[`${config.label}Options`] = options;
    configResult[`${config.label}Dict`] = dict;
  });

  // Sử dụng createOptionsAndDict cho city và career
  const { options: cityOptions, dict: cityDict } = this.createOptionsAndDict(cities);
  const { options: careerOptions, dict: careerDict } = this.createOptionsAndDict(careers);

  configResult['cityOptions'] = cityOptions;
  configResult['careerOptions'] = careerOptions;
  configResult['cityDict'] = cityDict;
  configResult['careerDict'] = careerDict;

  return configResult; // Trả về trực tiếp cấu hình
}

// Hàm chung để tạo options và dict
createOptionsAndDict(array: { id: string | number, name: string }[]) {
  const options = array.map(item => ({ id: item.id, name: item.name })); // Mảng các đối tượng { id, name }
  const dict = array.reduce((acc, item) => {
    acc[item.id] = item.name;
    return acc;
  }, {} as Record<string | number, string>); // Tạo dict với id là khóa và name là giá trị
  return { options, dict };
};



 async create_career_service( createCareerDto: CreateCareerDto) {
  const career = await this.getCareerByName(createCareerDto.name);
    if (career) {
      throw new ForbiddenException(`Carrer existing`);     
    }
    const newCareer = this.carrerRepository.create( {...createCareerDto});
    const saveCareer = await this.carrerRepository.save(newCareer);
    return saveCareer
 }

 async findAllCareer(): Promise<any> {
  return this.carrerRepository.find({});
}

async getCareerByName(name: string): Promise<any> {
  const career = await this.carrerRepository.findOne({ where: {name } });
  return career;
}

async findAllLocation(): Promise<any> {
  const locations = await this.locationRepository.find( {});
  return locations;
}

async getLocationByName(address: string): Promise<any> {
  const location = await this.locationRepository.findOne({ where: {address } });
  return location;
}


}

