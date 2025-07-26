import { RedisQueueConfig } from '../interfaces/redis';

export const redisQueueConfig = () => ({
  redisQueueConfig: {
    host: process.env.REDIS_QUEUE_HOST || 'localhost',
    port: process.env.REDIS_QUEUE_PORT
      ? Number(process.env.REDIS_QUEUE_PORT)
      : 6379,
    prefix: process.env.REDIS_QUEUE_PREFIX || 'esign_queue',
  } as RedisQueueConfig,
});
