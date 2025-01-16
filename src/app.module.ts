import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaService } from './utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailerModule } from './mailer/mailer.module';

import { MailerService } from './mailer/mailer.service';
import { MediaModule } from './media/media.module';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { APP_FILTER } from '@nestjs/core';
import { UnknownExceptionFilter } from './error/unknown-exception.filter';
import { OtpModule } from './otp/otp.module';
import { OtpService } from './otp/otp.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    MailerModule,
    OtpModule,
    MediaModule,
    FastifyMulterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    JwtService,
    OtpService,
    MailerService,
    {
      provide: APP_FILTER,
      useClass: UnknownExceptionFilter,
    },
  ],
})
export class AppModule {}
