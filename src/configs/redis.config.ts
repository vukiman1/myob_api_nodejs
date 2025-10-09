import { ConfigType, registerAs } from '@nestjs/config';
import { env, envNumber, envBoolean } from '../global/env';

export const redisRegToken = 'redis';

export const RedisConfig = registerAs(redisRegToken, () => ({
  host: env('REDIS_HOST', 'localhost'),
  port: envNumber('REDIS_PORT', 6379),
  db: envNumber('REDIS_DB', 0),
  maxRetriesPerRequest: envNumber('REDIS_MAX_RETRIES', 3),
  lazyConnect: envBoolean('REDIS_LAZY_CONNECT', true),
  keepAlive: envNumber('REDIS_KEEP_ALIVE', 30000),
  connectTimeout: envNumber('REDIS_CONNECT_TIMEOUT', 10000),
  commandTimeout: envNumber('REDIS_COMMAND_TIMEOUT', 5000),
}));

export type IRedisConfig = ConfigType<typeof RedisConfig>;
