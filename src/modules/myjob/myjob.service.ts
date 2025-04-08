import { Injectable, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {  CreateBannerDto, CreateBannerDto2, UpdateBannerDto } from './dto/banner.dto';
import { Banner } from './entities/banner.entity';
import { CreateFeedBackDto } from './dto/feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { User } from '../user/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UpdateFeedbackDto } from './dto/updateFeedback.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { WebNotification } from './entities/notifications.entity';

@Injectable()
export class MyjobService {

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,

    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>, // Inject Feedback repository

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(WebNotification)
    private webNotificationRepository: Repository<WebNotification>,
  ) {}
  async createBanner(createBannerDto: CreateBannerDto2) {
    console.log('createBannerDto', createBannerDto);
    const newBanner = this.bannerRepository.create({  ...createBannerDto });
    const savedBanner = await this.bannerRepository.save(newBanner);
    return savedBanner
  } 

  async uploadBanner(bannerDto: any, id: string ) {
    try {
      await this.bannerRepository.update(id, {
        type: bannerDto.type,
        imageUrl: bannerDto.imageUrl,
        description: bannerDto.description,
        buttonLink: bannerDto.buttonLink,
        isActive: bannerDto.isActive
      });
      return {
        success: true,
        message: 'Banner updated successfully',
      };
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw error;
    }
  }
  
  async deleteBanner(id: string) {
    await this.bannerRepository.delete(id)
    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }

  async uploadBannerUser(file: Express.Multer.File, userId: string, link: string) {
    console.log(link, file, userId)

    try {
      // Upload image and get the URL
      const { secure_url } = await this.cloudinaryService.uploadPageBanner2(
        file,
        'banner',
        'banner'
      );

      // Calculate end date (7 days from now)
      const endDate = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));

      // Description for the banner
      const description = `Banner created by user ${userId}`;

      // Find the user who uploaded the banner
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Create the new banner object
      const newBanner = this.bannerRepository.create({
        imageUrl: secure_url,
        user,
        endDate,
        buttonLink: link,
        description,
      });

      // Save the new banner to the database
      const savedBanner = await this.bannerRepository.save(newBanner);
      return savedBanner;
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw new Error('Failed to upload banner: ' + error.message);
    }
  }
  

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const vietnamTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    const newNotification = this.webNotificationRepository.create({  
      ...createNotificationDto,
      date: new Date(vietnamTime)
    });
    const savedNotification = await this.webNotificationRepository.save(newNotification);
    return savedNotification;
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

  async getAllNotification() {
    return await this.webNotificationRepository.find({
      where: {isDelete: false},
      order: {id: 'DESC'},
    })
  }

  async getAllBaner() {
    const banners = await this.bannerRepository.find({
      where: {isActive: true, type: 'BANNER'}
    });

    return banners.map(banner => ({
      id: banner.id,
      imageUrl: banner.imageUrl,
      description: banner.description,
      buttonLink: banner.buttonLink,

    }));
  }

  async markIsReadNoti(id: string) {
    const notification = await this.webNotificationRepository.findOne({ where: { id } });
    await this.webNotificationRepository.update(id,
      { read: !notification.read },
    );
    return { success: true };
  }
  async uloadBanner(file: Express.Multer.File,) {
    const imageUrl = await this.cloudinaryService.uploadBanner(
      file,
      'banner',
      'banner'
    )
    return imageUrl

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

  async createBanner2(createBannerDto2: CreateBannerDto2, @UploadedFile() file: Express.Multer.File) {
    const { imageUrl } = await this.cloudinaryService.uploadPageBanner(
      file,
      'banner',
      'banner'
    )
    const newBanner = this.bannerRepository.create({ ...createBannerDto2, imageUrl });
    const savedBanner = await this.bannerRepository.save(newBanner);
    return savedBanner
  }

  async getNewNotification() {
    const notifications = await this.webNotificationRepository.find({
      where: {isDelete: false, read: false},
      order: {id: 'DESC'},
      take: 5,
    })
    return notifications
  }

  async getPopups() {
    const popups = await this.bannerRepository.find({
      where: {type: 'POPUP', isActive: true},
    });

    return popups.map(popup => ({
      id: popup.id,
      imageUrl: popup.imageUrl,
      description: popup.description,
      buttonLink: popup.buttonLink,

    }));
  }
}
