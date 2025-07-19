import { Global, Module } from '@nestjs/common';
import { DatabaseConfigService } from './services/database-config/database-config.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { DbConnectionNames } from '../common/enums/DbConnectionNames';
import { ConfigModule } from '@nestjs/config';
import { modelCollection } from './services/model-collection';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useClass: DatabaseConfigService,
      name: DbConnectionNames.DEFAULT,
      inject: [ConfigModule],
    }),

    SequelizeModule.forFeature(modelCollection),
  ],
  providers: [DatabaseConfigService],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
