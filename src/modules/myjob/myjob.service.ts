import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {  CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { Banner } from './entities/banner.entity';
import { CreateFeedBackDto } from './dto/feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { User } from '../user/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UpdateFeedbackDto } from './dto/updateFeedback.dto';

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
  

  async createFeedback(createFeedBackDto: CreateFeedBackDto, email: string) {
    const user  = await this.userRepository.findOne({ where: { email } });
    const newFeedback = this.feedbackRepository.create({  ...createFeedBackDto, user });

    const savedFeedback = await this.feedbackRepository.save(newFeedback);
    return savedFeedback
  }

  async getFeedbacks() {
    const feedbacks = await this.feedbackRepository.find({relations: ['user'],});
    const activeFeedbacks = feedbacks.filter(feedback => feedback.isActive === true);
    return activeFeedbacks.map(feedback => ({
      id: feedback.id,
      content: feedback.content,
      rating: feedback.rating,
      isActive: feedback.isActive,
      userDict: {
        id: feedback.user.id,
        fullName: feedback.user.fullName,
        avatarUrl: feedback.user.avatarUrl,
      }
    }));
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

  async adminGetAllBanner() {
    const banners = await this.bannerRepository.find({});
    return banners
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

  async getAllFeedbacks() {
    const feedbacks = await this.feedbackRepository.find({relations: ['user'],});
    return feedbacks.map(feedback => ({
      id: feedback.id,
      content: feedback.content,
      rating: feedback.rating,
      isActive: feedback.isActive,
      createAt: feedback.createAt,
      userDict: {
        id: feedback.user.id,
        fullName: feedback.user.fullName,
        avatarUrl: feedback.user.avatarUrl,
      }
    }));
  }

  async updateFeedback(id: string, updateFeedbackDto: UpdateFeedbackDto):Promise<any> {
    await this.feedbackRepository.update(id, updateFeedbackDto);
    return this.findFeedbackById(id)
  }

  async findFeedbackById(id: string): Promise<any> {
    return this.feedbackRepository.findOne({ where: {id} });
  }

  async changeFeedbackStatus(id: string) {
    const feedback = await this.feedbackRepository.findOne({ where: {id} });
    feedback.isActive = !feedback.isActive;
    await this.feedbackRepository.save(feedback);
    return feedback
  }

  async changeBannerStatus(id: string) {
    const banner = await this.bannerRepository.findOne({ where: {id} });
    banner.isActive = !banner.isActive;
    await this.bannerRepository.save(banner);
    return banner
  }
}
