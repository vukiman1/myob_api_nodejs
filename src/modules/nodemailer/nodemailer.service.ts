import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodemailerService {
    constructor(private readonly mailService: MailerService) {}

    async sendMail() {
        console.log('ok');
        const name = 'nodemailer'
        const verificationLink = 'https://vieclam365.top/dang-nhap-ung-vien?successMessage=Email+xác+thực+thành+công'
        this.mailService.sendMail({
          to: 'anvuit734@gmail.com',
          subject: `Xác thực email!`,
          template: './email-verification', // Tên template
          context: {
            name,
            verificationLink,
          },
 
        });
      }

      async sendEmailVerification(name: string, email: string, verificationLink: string) {
        await this.mailService.sendMail({
          to: email,
          subject: 'Xác thực email của bạn',
          template: './email-verification', // Tên template
          context: {
            name,
            verificationLink,
          },
        });
      }
}
