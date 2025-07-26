import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { QueueConfigService } from './services/queue-config.service';
import { QueueNameEnum } from './enums/queue-name.enum';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: QueueConfigService,
    }),

    BullModule.registerQueue({
      name: QueueNameEnum.GeneralQueue,
    }),

    BullBoardModule.forRoot({
      route: 'queues-management',
      adapter: ExpressAdapter,
    }),

    BullBoardModule.forFeature({
      name: QueueNameEnum.GeneralQueue,
      adapter: BullAdapter,
    }),
  ],
  providers: [QueueConfigService],
  exports: [BullModule],
})
export class QueueModule {}
