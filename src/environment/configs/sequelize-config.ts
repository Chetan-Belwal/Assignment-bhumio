import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { DbConnectionNames } from '../../common/enums/DbConnectionNames';

export type DbConnectionConfigType<T extends Record<string, string>> = {
  [K in T[keyof T]]: SequelizeModuleOptions;
};

export const sequelizeConfig = () => {
  const config = {
    databases: {} as DbConnectionConfigType<typeof DbConnectionNames>,
  };

  config.databases.default = {
    dialect: 'postgres',
    uri: process.env.DB_URI,
    name: DbConnectionNames.DEFAULT,
    autoLoadModels: true,
    models: [__dirname + '/../../databases/models/**/*.ts'],
    logging: process.env.DB_LOGGING === 'true',
  };

  return config;
};
