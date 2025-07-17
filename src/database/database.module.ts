import { Module } from '@nestjs/common';
import { DatabaseConfigService } from './services/database-config/database-config.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbConnectionNames } from '../common/enums/DbConnectionNames';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: DatabaseConfigService,
      name: DbConnectionNames.DEFAULT,
      inject: [ConfigModule],
    }),
  ],
  providers: [DatabaseConfigService],
})
export class DatabaseModule {}
