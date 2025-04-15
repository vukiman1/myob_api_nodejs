import { BadRequestException, Injectable, UploadedFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { LessThan } from 'typeorm';
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
import { PaymentService } from '../payment/payment.service';
import { TransactionType } from '../payment/entities/payment.entity';
import { JobPost } from '../job/entities/job-post.entity';
import { NotificationQueryDto } from './entities/getnoti.dto';
import { NotFoundException } from '@nestjs/common';

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

    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,

    @InjectRepository(WebNotification)
    private webbannerRepository: Repository<WebNotification>,

    private paymentService: PaymentService
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

  async uploadBannerUser(file: Express.Multer.File, userId: string, link: string, type: string) {
    try {
      // Upload image and get the URL
      const { secure_url } = await this.cloudinaryService.uploadPageBanner2(
        file,
        'banner',
        'banner'
      );

      // Calculate end date (7 days from now)
      const endDate = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
      const money = 8000
      // Description for the banner
      const description = `Banner created by user ${userId}`;

      // Find the user who uploaded the banner
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.money < 8000) {
        throw new BadRequestException('User not enought money')
      }

      // await this.userRepository.update({})

      // Create the new banner object
      const newBanner = this.bannerRepository.create({
        imageUrl: secure_url,
        user,
        isActive: false,
        type,
        endDate,
        buttonLink: link,
        description,
      });

      await this.paymentService.createTransaction(money, TransactionType.PURCHASE, userId, "PURCHASE")
      // Save the new banner to the database
      const savedBanner = await this.bannerRepository.save(newBanner);
      return savedBanner;
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw new Error('Failed to upload banner: ' + error.message);
    }
  }

  async getPaymentService(userId: string) {
    const jobService = await this.jobPostRepository.find({
      where: {
        user: { id: userId },
        isUrgent: true,
        deadline: MoreThan(new Date())
        
      },
      select: ['id', 'jobName', 'isUrgent', 'deadline']
    });
  
    const bannerService = await this.bannerRepository.find({
      where: {
        user: { id: userId },
        endDate: MoreThan(new Date()),
        isExpried:false 
      },
      select: ['id', 'imageUrl', 'isActive', 'buttonLink', 'endDate', 'type']
    });
  
    return {
      jobService,
      bannerService
    };
  }
  
  async updateBannerUrgent(id: string) {
    const banner = await this.bannerRepository.findOne({ where: {id} });
    banner.isActive = !banner.isActive;
    await this.bannerRepository.save(banner);
    return banner
  }
  
  async updateJobPostUrgent(id: string) {
    const jobpost = await this.jobPostRepository.findOne({ where: { id: Number(id) } });
    jobpost.isUrgent = !jobpost.isUrgent;
    await this.jobPostRepository.save(jobpost);
    return jobpost
  }

  async createNotification(createNotificationDto: CreateNotificationDto, userId?: string) {
    const vietnamTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
      console.log(userId)
    let user = null;
    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    const newNotification = this.webbannerRepository.create({  
      ...createNotificationDto,
      date: new Date(vietnamTime),
      user: user
    });

    const savedNotification = await this.webbannerRepository.save(newNotification);
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
    return await this.webbannerRepository.find({
      where: {isDelete: false, user: null},
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
    const notification = await this.webbannerRepository.findOne({ where: { id } });
    await this.webbannerRepository.update(id,
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
    const notifications = await this.webbannerRepository.find({
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
  async getNotifications(query: NotificationQueryDto, roleName: string) {
    const { userId, page = 1, limit = 5 } = query;
    const skip = (page - 1) * limit;
    let defaultNotifications = []

    // Tạo notifications mặc định
    if (roleName === 'EMPLOYER') {
       defaultNotifications = [
        {
          id: "welcome-1",
          message: "Chào mừng bạn đến với hệ thống tìm kiếm việc làm!",
          type: "SYSTEM",
          title: "Chào mừng",
          isDelete: false,
          read: false,
          date: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        },
        {
          id: "welcome-2",
          message: "Cập nhật hồ sơ để nhận được nhiều cơ hội việc làm phù hợp hơn.",
          type: "SYSTEM",
          title: "Hoàn thiện hồ sơ của bạn",
          isDelete: false,
          read: false,
          date: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        },
        {
          id: "welcome-3",
          message: "Có nhiều việc làm mới phù hợp với kỹ năng của bạn. Xem ngay!",
          type: "SYSTEM",
          title: "Khám phá việc làm mới",
          isDelete: false,
          read: false,
          date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
  
      ];
    } else {
       defaultNotifications = [
        {
          id: "welcome-1",
          message: "Chào mừng bạn đến với hệ thống tìm kiếm việc làm!",
          type: "SYSTEM",
          title: "Chào mừng",
          isDelete: false,
          read: false,
          date: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        },
        {
          id: "welcome-2",
          message: "Đăng tin tuyển dụng để nhận được nhiều ứng viên phù hợp hơn.",
          type: "SYSTEM",
          title: "Tạo mới tin tuyển dụng",
          isDelete: false,
          read: false,
          date: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        }
  
      ];
    }
   

    // Query notifications của user từ database
    const userNotifications = await this.webbannerRepository.find({
      where: {
        user: { id: userId.toString() },
        isDelete: false,
      },
      order: {
        date: 'DESC',
      },
      skip,
      take: limit,
    });

    // // Format user notifications
    const formattedUserNotifications = userNotifications.map(notification => ({
      id: notification.id,
      message: notification.message,
      imageUrl: notification.imageUrl ,
      type: notification.type,
      title: notification.title,
      isDelete: notification.isDelete,
      read: notification.read,
      date: notification.date.toISOString(),
    }));

    // // Merge và sort notifications theo thời gian
    const allNotifications = [ ...formattedUserNotifications]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    const d2 = [...allNotifications, ...defaultNotifications]
    // Tính total pages
    const total = await this.webbannerRepository.count({
      where: { user: { id: userId.toString() }, isDelete: false },
    });

    return {
      notifications: d2,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((total + defaultNotifications.length) / limit),
        totalItems: total + defaultNotifications.length,
      }
    };
  }

  async findUserIdByJobId(jobId: number): Promise<string> {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: jobId },
      relations: ['user'],
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    return jobPost.user.id;
  }
}
