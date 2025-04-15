import { Global, Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { NodemailerController } from './nodemailer.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mailerRegToken } from 'src/configs/mailer.config';

@Global()
@Module({
  imports: [
    ConfigModule, // Đảm bảo ConfigModule được import
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mailerConfig = configService.get(mailerRegToken); // Sử dụng đúng token 'mailer'
        return {
          ...mailerConfig,
        };
      },
    }),
  ],
  controllers: [NodemailerController],
  providers: [NodemailerService],
  exports: [NodemailerModule],
})
export class NodemailerModule {}
