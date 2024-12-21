import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {


  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}




  async findAll(): Promise<User[]> {
    return this.userRepository.find({});
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

 
  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email:string):Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

}
