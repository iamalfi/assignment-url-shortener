import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/mailer.dto';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {
  mailTransport() {
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    return transporter;
  }

  async sendEmail(dto: SendEmailDto) {
    const { from, recipients, subject, html } = dto;

    const transporter = this.mailTransport();

    const options: Mail.Options = {
      from: from ?? {
        name: process.env.COMPANY_NAME,
        address: process.env.MAIL_SENDER,
      },
      to: recipients,
      subject,
      html,
    };
    try {
      const result = await transporter.sendMail(options);

      return result;
    } catch (error) {
      throw new UnauthorizedException('Error :' + error);
    }
  }
}
