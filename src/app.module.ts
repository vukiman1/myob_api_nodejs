import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import config from './configs/index'
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './configs/database.config';
import { User } from './modules/user/entities/user.entity';
import { DataSourceOptions } from 'typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { InfoModule } from './modules/info/info.module';
import { MyjobModule } from './modules/myjob/myjob.module';
import { CommonModule } from './modules/common/common.module';
import { JobModule } from './modules/job/job.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { NodemailerModule } from './modules/nodemailer/nodemailer.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminUserModule } from './modules/admin/user/user.module';
import { AdminCompanyModule } from './modules/admin/admin-company/admin-company.module';
import { AdminJobPostModule } from './modules/admin/admin-job-post/admin-job-post.module';
import { AdminWebModule } from './modules/admin/admin-web/admin-web.module';
import { AdminJobModule } from './modules/admin/admin-job/admin-job.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...Object.values(config)],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseConfig =  configService.get<DataSourceOptions>('database');
        return {
          ...databaseConfig,
          autoLoadEntities: true,
        };
      },
  
    }),
    UserModule,
    AuthModule,
    InfoModule,
    MyjobModule,
    CommonModule,
    JobModule,
    CloudinaryModule,
    NodemailerModule,
    PaymentModule,
    AdminUserModule,
    AdminCompanyModule,
    AdminJobPostModule,
    AdminWebModule,
    AdminJobModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

