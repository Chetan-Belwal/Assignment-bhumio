import { Injectable } from '@nestjs/common';
import { SharedBullConfigurationFactory } from '@nestjs/bull/dist/interfaces/shared-bull-config.interface';
import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bull';
import { RedisQueueConfig } from '../../environment/interfaces/redis';

@Injectable()
export class QueueConfigService implements SharedBullConfigurationFactory {
  constructor(protected configService: ConfigService) {}

  createSharedConfiguration():
    | Promise<BullRootModuleOptions>
    | BullRootModuleOptions {
    return {
      redis: this.configService.get<RedisQueueConfig>('redisQueueConfig'),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
      },
    };
  }
}
