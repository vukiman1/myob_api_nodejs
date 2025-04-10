import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentHistory } from './entities/payment.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule, 
    TypeOrmModule.forFeature([PaymentHistory]),
    ConfigModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}
