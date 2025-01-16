import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/utils/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [UrlController],
  providers: [UrlService, JwtService, PrismaService, RedisService],
})
export class UrlModule {}
