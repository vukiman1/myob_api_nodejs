import { ConfigType, registerAs } from '@nestjs/config';
import { env, envNumber, envBoolean } from '../global/env';

export const mailerRegToken = 'mailer';

export const MailerConfig = registerAs(mailerRegToken, () => ({
  host: env('MAIL_HOST', 'smtp.gmail.com'),
  port: envNumber('MAIL_PORT', 587),
  secure: envBoolean('MAIL_SECURE', false), // true nếu dùng port 465
  auth: {
    user: env('MAIL_USER', 'your-email@example.com'),
    pass: env('MAIL_PASSWORD', 'your-email-password'),
  },
  defaultFrom: env('MAIL_FROM', '"Your Company" <your-email@example.com>'),
}));

export type IMailerConfig = ConfigType<typeof MailerConfig>;
