import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { PrismaService } from 'src/utils/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { NotFoundException } from '@nestjs/common';
import * as shortid from 'shortid';
import determineWebsiteType from 'src/helper/determineWebsiteType';

jest.mock('shortid');
jest.mock('src/helper/determineWebsiteType');

describe('UrlService', () => {
  let service: UrlService;
  let prisma: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: {
            url: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              checkRateLimit: jest.fn(),
              getRateLimitStatus: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            setCache: jest.fn(),
            getCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    prisma = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('create', () => {
    it('should create a shortened URL', async () => {
      const mockUser: IUserPayload = {
        id: 'user123',
        email: 'user@example.com',
        sub: {
          name: 'Lucifer',
        },
        iat: 1234567890,
        exp: 1234567990,
      };
      const mockDto = { original_url: 'https://example.com' };
      const shortCode = 'short123';
      const websiteType = { shortTag: 'web' };
      (shortid.generate as jest.Mock).mockReturnValue(shortCode);
      (determineWebsiteType as jest.Mock).mockReturnValue(websiteType);

      const mockUrl = {
        userId: mockUser.id,
        original_url: mockDto.original_url,
        short_code: shortCode,
        click_count: 0,
      };

      prisma.url.create = jest.fn().mockResolvedValue(mockUrl);
      redisService.setCache = jest.fn().mockResolvedValue(null);
      redisService.checkRateLimit = jest.fn().mockResolvedValue(null);
      redisService.getRateLimitStatus = jest
        .fn()
        .mockResolvedValue({ remaining: 10, reset: new Date().toISOString() });

      const result = await service.create(mockUser, mockDto);

      expect(result).toEqual({
        status: 'OK',
        message: 'The URL has been successfully created.',
        url: `${process.env.HOST_URL}/web/${shortCode}`,
        rate_limit: {
          remaining: 10,
          reset: expect.any(String),
        },
      });
      expect(prisma.url.create).toHaveBeenCalledWith({
        data: mockUrl,
      });
      expect(redisService.setCache).toHaveBeenCalledWith(
        shortCode,
        mockDto.original_url,
      );
      expect(redisService.checkRateLimit).toHaveBeenCalledWith(mockUser.id);
      expect(redisService.getRateLimitStatus).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should fetch all URLs', async () => {
      const mockUrls = [
        { id: '1', original_url: 'https://example1.com', short_code: 'abc123' },
      ];
      prisma.url.findMany = jest.fn().mockResolvedValue(mockUrls);

      const result = await service.findAll();

      expect(result).toEqual({
        status: 'OK',
        message: 'URLs fetched Successfully',
        data: mockUrls,
      });
    });
  });

  describe('fetchByUser', () => {
    it('should fetch URLs by user', async () => {
      const mockUser: IUserPayload = {
        id: 'user123',
        email: 'user@example.com',
        sub: {
          name: 'Lucifer',
        },
        iat: 1234567890,
        exp: 1234567990,
      };
      const mockUrls = [
        { id: '1', original_url: 'https://example1.com', short_code: 'abc123' },
      ];
      prisma.url.findMany = jest.fn().mockResolvedValue(mockUrls);

      const result = await service.fetchByUser(mockUser);

      expect(result).toEqual({
        status: 'OK',
        message: 'URLs fetched Successfully',
        data: mockUrls,
      });
    });
  });

  describe('analyticsforUser', () => {
    it('should fetch analytics for user', async () => {
      const mockUser: IUserPayload = {
        id: 'user123',
        email: 'user@example.com',
        sub: {
          name: 'Lucifer',
        },
        iat: 1234567890,
        exp: 1234567990,
      };
      prisma.url.count = jest.fn().mockResolvedValue(10);
      prisma.url.findFirst = jest.fn().mockResolvedValue({
        short_code: 'abc123',
        original_url: 'https://example.com',
        click_count: 100,
      });

      const result = await service.analyticsforUser(mockUser);

      expect(result).toEqual({
        status: 'OK',
        message: 'Analytics fetched successfully',
        data: {
          totalUrls: 10,
          mostAccessedUrl: {
            short_code: 'abc123',
            original_url: 'https://example.com',
            click_count: 100,
          },
          leastAccessedUrl: {
            short_code: 'abc123',
            original_url: 'https://example.com',
            click_count: 100,
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should fetch a URL by short code from cache', async () => {
      const id = 'short123';
      const mockUrl = 'https://example.com';
      redisService.getCache = jest.fn().mockResolvedValue(mockUrl);

      const result = await service.findOne(id);

      expect(result).toEqual({
        status: 'OK',
        message: 'URL fetched from cache successfully',
        url: mockUrl,
      });
    });

    it('should fetch a URL by short code from database', async () => {
      const id = 'short123';
      const mockUrl = {
        id: '1',
        original_url: 'https://example.com',
        short_code: id,
        click_count: 5,
      };
      redisService.getCache = jest.fn().mockResolvedValue(null);
      prisma.url.findUnique = jest.fn().mockResolvedValue(mockUrl);
      prisma.url.update = jest.fn().mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toEqual({
        status: 'OK',
        message: 'URL fetched successfully',
        url: mockUrl.original_url,
      });
    });

    it('should throw NotFoundException if URL not found', async () => {
      const id = 'short123';
      redisService.getCache = jest.fn().mockResolvedValue(null);
      prisma.url.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a URL by id', async () => {
      const id = '1';
      prisma.url.delete = jest.fn().mockResolvedValue(null);

      const result = await service.remove(id);

      expect(result).toEqual({
        status: 'OK',
        message: 'URL deleted successfully.',
      });
    });
  });
});
