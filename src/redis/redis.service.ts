import {
  Injectable,
  OnModuleDestroy,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Redis from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis.RedisClientType;
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly WINDOW_SIZE_IN_SECONDS = 60;

  constructor() {
    const redisConfig = {
      host: process.env.REDIST_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    };

    this.client = Redis.createClient(redisConfig);

    this.client
      .connect()
      .then(() => {
        console.log('Redis connected successfully');
      })
      .catch((err) => {
        console.error('Redis connection error:', err);
      });
  }

  async setCache(key: string, value: string) {
    return await this.client.setEx(key, 3600, value);
  }

  async getCache(key: string) {
    return await this.client.get(key);
  }

  async delCache(key: string) {
    return await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async checkRateLimit(userId: string): Promise<boolean> {
    const key = `rateLimit:${userId}`;
    const now = Date.now();
    const windowStart = now - this.WINDOW_SIZE_IN_SECONDS * 1000;

    await this.client.zAdd(key, { score: now, value: now.toString() });
    await this.client.zRemRangeByScore(key, 0, windowStart);

    await this.client.expire(key, this.WINDOW_SIZE_IN_SECONDS);

    const requestCount = await this.client.zCard(key);

    if (requestCount > this.MAX_REQUESTS_PER_MINUTE) {
      throw new HttpException(
        `Rate limit exceeded. Maximum ${this.MAX_REQUESTS_PER_MINUTE} requests per minute.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  async getRateLimitStatus(
    userId: string,
  ): Promise<{ remaining: number; reset: number }> {
    const key = `rateLimit:${userId}`;
    const now = Date.now();
    const windowStart = now - this.WINDOW_SIZE_IN_SECONDS * 1000;

    await this.client.zRemRangeByScore(key, 0, windowStart);

    const requestCount = await this.client.zCard(key);
    const remaining = Math.max(0, this.MAX_REQUESTS_PER_MINUTE - requestCount);

    const oldestRequest = await this.client.zRange(key, 0, 0);
    const reset =
      oldestRequest.length > 0
        ? parseInt(oldestRequest[0]) + this.WINDOW_SIZE_IN_SECONDS * 1000
        : now + this.WINDOW_SIZE_IN_SECONDS * 1000;

    return {
      remaining,
      reset,
    };
  }
}
