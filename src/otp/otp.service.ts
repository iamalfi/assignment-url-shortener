import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { GenerateOtpDto, OtpPayloadDto, VerifyOtpDto } from './dto/otp.dto';
import { MailerService } from 'src/mailer/mailer.service';
import otpTemplate from 'src/mails/otp';

@Injectable()
export class OtpService {
  constructor(
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async generateOTPToken(dto: GenerateOtpDto) {
    const otp = this.generateOTP();
    const expirationTime = this.getExpirationTime();
    const payload: OtpPayloadDto = {
      email: dto.email,
      otp,
      exp: expirationTime,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.jwtOtpSecretKey,
    });
    await this.mailerService.sendEmail({
      recipients: [
        {
          name: '',
          address: dto.email,
        },
      ],
      subject: 'Account Verification',
      html: otpTemplate({ otp, url: dto.url, token }),
      text: '',
      from: {
        name: process.env.COMPANY_NAME,
        address: process.env.MAIL_SENDER,
      },
    });
    return {
      status: 'OK',
      token,
    };
  }

  async verifyOTPToken(dto: VerifyOtpDto) {
    try {
      const payload: OtpPayloadDto = await this.jwtService.verifyAsync(
        dto.token,
        {
          secret: process.env.jwtOtpSecretKey,
        },
      );
      if (dto.otp !== payload.otp)
        throw new UnauthorizedException('Invalid OTP');
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('OTP token has expired');
      }
      return {
        status: 'Ok',
        message: 'Email verified',
        email: payload.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid OTP token');
    }
  }
  private generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  private getExpirationTime(): number {
    return Math.floor(Date.now() / 1000) + 600; // 10 minutes from now
  }
}
