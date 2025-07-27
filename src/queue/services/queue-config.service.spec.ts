import { Test, TestingModule } from '@nestjs/testing';
import { QueueConfigService } from './queue-config.service';
import { ConfigService } from '@nestjs/config';

describe('QueueConfigService', () => {
  let service: QueueConfigService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QueueConfigService>(QueueConfigService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSharedConfiguration', () => {
    it('should return the correct BullMQ configuration', () => {
      const redisConfig = {
        host: 'localhost',
        port: 6379,
      };
      mockConfigService.get.mockReturnValue(redisConfig);

      const config = service.createSharedConfiguration();

      expect(config).toEqual({
        redis: redisConfig,
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
      });

      expect(configService.get).toHaveBeenCalledWith('redisQueueConfig');
    });
  });
});
