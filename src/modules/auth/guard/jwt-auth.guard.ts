import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
    constructor(private configService: ConfigService) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: configService.get<string>('JWT_SECRET'),
        });

      }
      async validate(payload: any) {

        // Payload chứa thông tin từ JWT, ví dụ như userId
        return { id: payload.id, email: payload.email };
      }
}
