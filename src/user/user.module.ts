import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/utils/prisma.service';

import { MailerService } from 'src/mailer/mailer.service';
import { OtpService } from 'src/otp/otp.service';

@Module({
  providers: [
    UserService,
    PrismaService,
    JwtService,
    OtpService,
    MailerService,
  ],
  controllers: [UserController],
})
export class UserModule {}
