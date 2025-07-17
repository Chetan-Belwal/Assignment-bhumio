import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { sequelizeConfig } from './configs/sequelize-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [sequelizeConfig],
    }),
  ],
})
export class EnvironmentModule {}
