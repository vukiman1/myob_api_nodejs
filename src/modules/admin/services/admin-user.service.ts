import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getUsers(options: {
    search?: string;
    roleName?: string;
    isVerifyEmail?: boolean;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const { search, roleName, isVerifyEmail, isActive, page = 1, pageSize = 10 } = options;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.email LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    if (roleName) {
      queryBuilder.andWhere('user.roleName = :roleName', { roleName });
    }
    
    if (isVerifyEmail !== undefined) {
      queryBuilder.andWhere('user.isVerifyEmail = :isVerifyEmail', { isVerifyEmail });
    }
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }
    
    const currentPage = page ? parseInt(page.toString()) : 1;
    const limit = pageSize ? parseInt(pageSize.toString()) : 10;
    const skip = (currentPage - 1) * limit;
    queryBuilder
      .orderBy('user.id', 'DESC')
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    return {
      data: users,
      count: total
    };
  }

  async getUserDetails(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id.toString() },
    });
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return await this.userRepository.findOne({ where: { id: id.toString() } });
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id: id.toString() } });
    if (user) {
      await this.userRepository.remove(user);
      return true;
    }
    return false;
  }
}
