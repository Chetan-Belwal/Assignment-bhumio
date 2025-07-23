import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { modelCollection } from '../model-collection';

@Injectable()
export class DatabaseConfigService implements SequelizeOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createSequelizeOptions(
    connectionName?: string,
  ): Promise<SequelizeModuleOptions> | SequelizeModuleOptions {
    const config: SequelizeModuleOptions =
      this.configService.get<SequelizeModuleOptions>(
        `databases.${connectionName}`,
      );

    config.models = modelCollection;
    return config;
  }
}
