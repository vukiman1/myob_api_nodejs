import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { JobSeekerProfile } from '../info/entities/job_seeker_profle.entities';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ISecurityConfig } from 'src/configs';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Location } from '../common/entities/location.entity';
import { Company } from '../info/entities/company.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Resume } from '../info/entities/resume.entity';
import { NodemailerService } from '../nodemailer/nodemailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      JobSeekerProfile,
      Location,
      Company,
      Resume,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const { jwtSecret, jwtExprire } =
          configService.get<ISecurityConfig>('security');
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: `${jwtExprire}s`,
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    JobSeekerProfile,
    CloudinaryModule,
  ],
  exports: [JwtModule, AuthService],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, NodemailerService],
})
export class AuthModule {}
