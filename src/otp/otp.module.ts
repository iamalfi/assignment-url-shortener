import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/utils/prisma.service';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  controllers: [OtpController],
  providers: [OtpService, JwtService, PrismaService, MailerService],
})
export class OtpModule {}
