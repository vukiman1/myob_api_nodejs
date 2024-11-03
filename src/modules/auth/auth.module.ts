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
<<<<<<< HEAD
import { ConfigKeyPaths } from 'src/configs';
import { ISecurityConfig } from 'src/configs/security.config';
import { JwtStrategy } from './strategies/jwt.strategy';
=======
import { ConfigKeyPaths, ISecurityConfig } from 'src/configs';
import { JwtStrategy } from './strategies/jwt.strategy';

>>>>>>> b8993b5a819001b5050bed3f36971d026aecf095

@Module({
  imports: [
    TypeOrmModule.forFeature([User, JobSeekerProfile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
       useFactory: async (configService: ConfigService) => {
        const { jwtSecret, jwtExprire }
          = configService.get<ISecurityConfig>('security')
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: `${jwtExprire}s`,
          },
        }
      },
      inject: [ConfigService],
    }),
    UserModule,
    JobSeekerProfile
  ],
  exports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
