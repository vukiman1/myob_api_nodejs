import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([City, District]),
  ],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
