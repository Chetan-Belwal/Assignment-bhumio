import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { sequelizeConfig } from './configs/sequelize-config';
import { sessionConfig } from './configs/session.config';
import { appConfig } from './configs/app-config';
import { redisQueueConfig } from './configs/redis.config';
import { documensoConfig } from './configs/documenso.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        sequelizeConfig,
        sessionConfig,
        appConfig,
        redisQueueConfig,
        documensoConfig,
      ],
    }),
  ],
})
export class EnvironmentModule {}
