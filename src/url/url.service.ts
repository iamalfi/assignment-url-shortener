import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import { PrismaService } from 'src/utils/prisma.service';
import determineWebsiteType from 'src/helper/determineWebsiteType';
import * as shortid from 'shortid';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UrlService {
  constructor(
    private prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}
  async create(user: IUserPayload, dto: CreateUrlDto) {
    await this.redisService.checkRateLimit(user.id);
    const shortCode = shortid.generate();
    const websiteType = determineWebsiteType(dto.original_url);
    const shortUrl = `${process.env.HOST_URL as string}/${
      websiteType.shortTag
    }/${shortCode}`;

    await this.prisma.url.create({
      data: {
        userId: user.id,
        original_url: dto.original_url,
        short_code: shortCode,
        click_count: 0,
      },
    });
    await this.redisService.setCache(shortCode, dto.original_url);

    const rateLimitStatus = await this.redisService.getRateLimitStatus(user.id);

    return {
      status: 'OK',
      message: 'The URL has been successfully created.',
      url: shortUrl,
      rate_limit: {
        remaining: rateLimitStatus.remaining,
        reset: new Date(rateLimitStatus.reset).toISOString(),
      },
    };
  }
  async findAll() {
    const url_list = await this.prisma.url.findMany();
    return {
      status: 'OK',
      message: 'URLs fetched Successfully',
      data: url_list,
    };
  }
  async fetchByUser(user: IUserPayload) {
    const url_list = await this.prisma.url.findMany({
      where: {
        userId: user.id,
      },
    });
    return {
      status: 'OK',
      message: 'URLs fetched Successfully',
      data: url_list,
    };
  }

  async analyticsforUser(user: IUserPayload) {
    const analytics = await Promise.all([
      this.prisma.url.count({
        where: {
          userId: user.id,
        },
      }),

      this.prisma.url.findFirst({
        where: { userId: user.id },
        orderBy: {
          click_count: 'desc',
        },
        select: {
          short_code: true,
          original_url: true,
          click_count: true,
        },
      }),

      this.prisma.url.findFirst({
        where: { userId: user.id },
        orderBy: {
          click_count: 'asc',
        },
        select: {
          short_code: true,
          original_url: true,
          click_count: true,
        },
      }),
    ]);

    const [totalUrls, mostAccessedUrl, leastAccessedUrl] = analytics;

    return {
      status: 'OK',
      message: 'Analytics fetched successfully',
      data: {
        totalUrls,
        mostAccessedUrl,
        leastAccessedUrl,
      },
    };
  }

  async findOne(id: string) {
    const cachedUrl = await this.redisService.getCache(id);
    if (cachedUrl) {
      return {
        status: 'OK',
        message: 'URL fetched from cache successfully',
        url: cachedUrl,
      };
    }

    const url = await this.prisma.url.findUnique({
      where: {
        short_code: id,
      },
    });

    if (!url) {
      throw new NotFoundException('Shortened URL not found');
    }

    await this.prisma.url.update({
      where: {
        id: url.id,
      },
      data: {
        click_count: url.click_count + 1,
      },
    });

    await this.redisService.setCache(id, url.original_url);

    return {
      status: 'OK',
      message: 'URL fetched successfully',
      url: url.original_url,
    };
  }

  async remove(id: string) {
    await this.prisma.url.delete({
      where: {
        id: id,
      },
    });

    return {
      status: 'OK',
      message: 'URL deleted successfully.',
    };
  }
}
