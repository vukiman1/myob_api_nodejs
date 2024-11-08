import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {  CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { Banner } from './entities/banner.entity';
import { CreateFeedBackDto } from './dto/feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MyjobService {
  
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,

    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>, // Inject Feedback repository

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async createBanner(createBannerDto: CreateBannerDto) {
    const newBanner = this.bannerRepository.create({  ...createBannerDto });
    const savedBanner = await this.bannerRepository.save(newBanner);
    return savedBanner
  } 
  

  async createFeedback(createFeedBackDto: CreateFeedBackDto, id: string) {
    const newFeedback = this.feedbackRepository.create({  ...createFeedBackDto });

    const savedFeedback = await this.feedbackRepository.save(newFeedback);
    return savedFeedback
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
  //ok

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
