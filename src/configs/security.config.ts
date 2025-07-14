import { ConfigType, registerAs } from '@nestjs/config';

import { env, envNumber } from '../global/env';

export const securityRegToken = 'security';

export const SecurityConfig = registerAs(securityRegToken, () => ({
  jwtSecret: env('JWT_SECRET', 'secret'),
  jwtExprire: envNumber('JWT_EXPIRE', 3600),
  refreshSecret: env('REFRESH_TOKEN_SECRET', 'refresh_secret'),
  refreshExpire: envNumber('REFRESH_TOKEN_EXPIRE', 86400),
}));

export type ISecurityConfig = ConfigType<typeof SecurityConfig>;
