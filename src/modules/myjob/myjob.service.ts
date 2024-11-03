import { Injectable } from '@nestjs/common';
import { CreateMyjobDto } from './dto/create-myjob.dto';
import { UpdateMyjobDto } from './dto/update-myjob.dto';
import { InjectRepository } from '@nestjs/typeorm';
<<<<<<< HEAD
import { Banner } from './entities/banner.entity';
import { Repository } from 'typeorm';
import { BannerDto, CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
=======
import { Repository } from 'typeorm';
import { BannerDto, CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { Banner } from './entities/banner.entity';
>>>>>>> b8993b5a819001b5050bed3f36971d026aecf095

@Injectable()
export class MyjobService {
  
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>
  ) {}
  async createBanner(createBannerDto: CreateBannerDto) {
    const newBanner = this.bannerRepository.create({  ...createBannerDto });
    const savedUser = await this.bannerRepository.save(newBanner);
    return savedUser
  }


  async getAllBaner() {
    const banners = await this.bannerRepository.find({});
    const activeBanners = banners.filter(banner => banner.isActive === true);
    return activeBanners.map(banner => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText,
      description: banner.description,
      buttonLink: banner.buttonLink,
      isShowButton: banner.isShowButton,
      descriptionLocation: banner.descriptionLocation
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} myjob`;
  }

  async updateBanner(id: string, updateBannerDto: UpdateBannerDto):Promise<any> {
    await this.bannerRepository.update(id, updateBannerDto);
    return this.findBannerById(id)
  }

  removeBanner(id: string) {
    return `This action removes a #${id} myjob`;
  }
  async findBannerById(id: string): Promise<any> {
    return this.bannerRepository.findOne({ where: {id} });
  }
}
