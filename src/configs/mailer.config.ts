import { ConfigType, registerAs } from '@nestjs/config';
import { env, envNumber, envBoolean } from '../global/env';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'; // Import HandlebarsAdapter

export const mailerRegToken = 'mailer';
export const MailerConfig = registerAs(mailerRegToken, () => ({
  transport: {
    host: env('MAIL_HOST', 'smtp.gmail.com'),
    // port: envNumber('MAIL_PORT', 587), // Mặc định là 587 (TLS)
    secure: envBoolean('MAIL_SECURE', false), // `true` nếu dùng port 465 (SSL)
    auth: {
      user: env('MAIL_USER', 'anvu734@gmail.com'), 
      pass: env('MAIL_PASSWORD', 'xvhr xvcd dceg towe'), 
    },
  },
  defaults: {
    from: env('MAIL_FROM', 'Việc làm 365 <vieclam365.top>'),
  },
  template: {
    dir: join(__dirname, '../modules/nodemailer/templates'), 
    adapter: new HandlebarsAdapter(), 
    options: {
      strict: true, // Kiểm tra lỗi trong template
    },
  },
  
}));
export type IMailerConfig = ConfigType<typeof MailerConfig>;
