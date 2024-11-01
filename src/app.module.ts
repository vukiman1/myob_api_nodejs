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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

