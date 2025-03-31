import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';

import { Repository } from 'typeorm';

@Injectable()
export class AdminUserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
      ) {}
    async getUsersInfo(id: string) {
        return this.userRepository.find({
            where: { id },
            relations: ['jobSeekerProfile', 'company'],
        });
    }
}
