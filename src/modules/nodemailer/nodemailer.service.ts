import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmployeeSendEmailDto } from './../job/dto/employee-send-email.dto';


@Injectable()
export class NodemailerService {
    constructor(private readonly mailService: MailerService) {}
    async sendMail() {
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

      async sendEmailVerification(name: string, email: string, verificationToken: string, role: string) {
        let verificationLink = `http://localhost:8000/api/auth/verify-email?token=${verificationToken}`; 

        if (role === 'EMPLOYEE') {
          verificationLink = `http://localhost:8000/api/auth/employee-verify-email?token=${verificationToken}`; 
        }
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
      async employeeSendEmail(EmployeeSendEmailDto: EmployeeSendEmailDto, employerrEmail: string, companyName: string, jobName: string,jobPostSlug: string, companySlug: string) {
        const {email, title, content, fullName, isSendMe} = EmployeeSendEmailDto
        let mailList = [email]
        if(isSendMe) {
          mailList.push(employerrEmail)
        }
        
        await this.mailService.sendMail({
          to:  mailList.join(','),
          subject: title,
          template: './employee-send-email', // Tên template
          context: {
            content,
            fullName,
            title,
            email,
            companyName,
            jobName,
            jobPostSlug,
            companySlug,
          },
        });
      }
      async sendEmailforgotPassword(email: string, token: string) {
        const resetLink = `https://vieclam365.top/cap-nhat-mat-khau/${token}`; 
        await this.mailService.sendMail({
          to: email,
          subject: 'Đặt lại mật khẩu của bạn!',
          template: './email-forgot-password', // Tên template
          context: {
            resetLink,
          },
        });
      }

      async sendJobAcceptedEmail(
        candidateEmail: string,
        data: {
          fullName: string;
          jobName: string;
          companyName: string;
          location: string;
          companyEmail: string;
          companyPhone: string;
          jobPostSlug: string;
        }
      ) {
        await this.mailService.sendMail({
          to: candidateEmail,
          subject: `Chúc mừng! Bạn đã trúng tuyển vị trí ${data.jobName} tại ${data.companyName}`,
          template: './job-accepted',
          context: {
            ...data
          },
        });
      }

      
}

