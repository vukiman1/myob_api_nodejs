import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {


  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email:string):Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserByFullName(fullName:string):Promise<User> {
    return this.userRepository.findOne({ where: { fullName } });
  }

  async findUserById(id:string):Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findUserByRoleName(roleName:string):Promise<User> {
    return this.userRepository.findOne({ where: { roleName } });
  }

  async getUserMoney(id: string): Promise<number> {
    const result = await this.userRepository.findOne({
      where: { id },
      select: ['money']
    });
    return result?.money ?? 0;
  }

  async updateUserMoney(id: string, money: number, type: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (type === "DEPOSIT") {
      user.money = user.money + money;
    } else if (type === "PURCHASE"){
      user.money = user.money - money;
    }
    return this.userRepository.save(user);
  }


}

